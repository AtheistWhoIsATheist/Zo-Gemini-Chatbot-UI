import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { connectDB } from './src/backend/db';
import { startCronJobs } from './src/backend/cron-jobs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Connect to MongoDB
  await connectDB();

  // Start Autonomous Densification Loops
  startCronJobs();

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'The Void-Graph Protocol is active.' });
  });

  app.post('/api/synthesize-community', async (req, res) => {
    try {
      const { nodes } = req.body;
      if (!nodes || !Array.isArray(nodes)) {
        return res.status(400).json({ error: 'Invalid nodes data' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const nodeText = nodes.map((n: any) => `ID: ${n.id}, Label: ${n.label}, Tags: ${n.tags?.join(', ')}`).join('\n');
      
      const prompt = `
        You are the AutoNarrative Semantic Oracle of the Nihiltheism Engine.
        Analyze the following cluster of interconnected nodes from our knowledge graph.
        
        Nodes:
        ${nodeText}
        
        Provide a JSON response with two fields:
        1. "label": A concise, profound, 2-4 word thematic label for this community.
        2. "summary": A dense, 2-3 sentence philosophical synthesis of how these concepts interrelate, focusing on tension, void, and presence.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const resultText = response.text || '{}';
      const result = JSON.parse(resultText);

      res.json(result);
    } catch (error: any) {
      console.error('[API] Error synthesizing community:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[SYSTEM] Server running on http://localhost:${PORT}`);
    console.log(`[SYSTEM] Autonomous Socratic Loops initialized.`);
  });
}

startServer().catch(console.error);
