import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { connectDB, getNodesCollection } from './src/backend/db';
import { startCronJobs } from './src/backend/cron-jobs';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Connect to MongoDB
  await connectDB();

  // Start Autonomous Densification Loops
  startCronJobs();

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'The Void-Graph Protocol is active.' });
  });

  // [INGESTION VOID] Taskade Webhook Integration
  app.post('/api/webhooks/taskade', async (req, res) => {
    try {
      const payload = req.body;
      
      // Layer 2 (Logic): Trace the 'task.added' trigger
      // Taskade webhooks typically send the event type. We accept 'task.added' or process anyway if not strictly defined.
      const eventType = payload.event || payload.type;
      if (eventType && eventType !== 'task.added') {
        return res.status(200).json({ message: `Event ${eventType} ignored. Awaiting task.added.` });
      }

      // Layer 3 (Integrity): Ensure the 'Raw Drop' column is correctly mapped
      // Taskade payload structure varies, we aggressively extract the content.
      const rawDrop = payload.task?.content || payload.data?.content || payload.text || payload.content || JSON.stringify(payload);
      
      if (!rawDrop || rawDrop.trim() === '' || rawDrop === '{}') {
        return res.status(400).json({ error: 'Raw Drop is empty. The Void cannot ingest nothingness without form.' });
      }

      const nodesCollection = getNodesCollection();
      if (!nodesCollection) {
        return res.status(500).json({ error: 'Database connection severed.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const ai = new GoogleGenAI({ apiKey });

      // The 7-Step Protocol
      const prompt = `
        You are the Ingestion Void of the Nihiltheism Engine.
        Process this 'Raw Drop' through the 7-Step Protocol:
        1. Deconstruct the raw text.
        2. Identify core ontological themes (Void, Rupture, Apophasis).
        3. Generate a precise label (2-5 words).
        4. Synthesize a dense summary (2-3 sentences).
        5. Extract 3 relevant tags.
        6. Formulate 1 Socratic aporia question.
        7. Format as JSON.

        Raw Drop: "${rawDrop}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              summary: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              socratic_question: { type: Type.STRING }
            },
            required: ['label', 'summary', 'tags', 'socratic_question']
          }
        }
      });

      const resultText = response.text || '{}';
      const result = JSON.parse(resultText);

      const newNode = {
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        label: result.label || 'Unlabeled Void Fragment',
        type: 'concept',
        status: 'RAW',
        summary: result.summary || 'Awaiting further densification.',
        blocks: [
          {
            id: `blk_${Date.now()}`,
            type: 'text',
            content: rawDrop,
            metadata: { lastEdited: Date.now() }
          }
        ],
        socratic_questions: [
          { text: result.socratic_question || 'What remains when this structure collapses?', aporia_state: 'Active' }
        ],
        metadata: {
          tags: result.tags || ['raw_drop'],
          date_added: new Date().toISOString(),
          source: 'Taskade Ingestion Void'
        },
        saturation_level: 10, // Low saturation triggers Nightly Densification
        revision_count: 0,
        last_audited_date: new Date()
      };

      await nodesCollection.insertOne(newNode);
      console.log(`[INGESTION VOID] Successfully processed and ingested: ${newNode.label}`);

      res.status(200).json({ 
        status: 'success', 
        message: 'The Void has consumed the drop.', 
        node_id: newNode.id,
        protocol_executed: true
      });

    } catch (error: any) {
      console.error('[INGESTION VOID] Critical Failure:', error);
      res.status(500).json({ error: error.message || 'Internal server error during ingestion.' });
    }
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
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              summary: { type: Type.STRING }
            },
            required: ['label', 'summary']
          }
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYSTEM] Server running on http://localhost:${PORT}`);
    console.log(`[SYSTEM] Autonomous Socratic Loops initialized.`);
  });
}

startServer().catch(console.error);
