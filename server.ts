/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import cron from 'node-cron';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { densificationPrompt } from './src/backend/ai-prompts';
import { corpusNodes } from './src/data/corpus';

dotenv.config();

const PORT = 3000;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// In-memory state for the preview (simulating the DB)
let dbNodes = [...corpusNodes];
let weeklyDigest = '';

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API ROUTES ---

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', nodes: dbNodes.length });
  });

  app.get('/api/nodes', (req, res) => {
    res.json(dbNodes);
  });

  app.get('/api/digest', (req, res) => {
    res.json({ digest: weeklyDigest });
  });

  // --- CRON JOBS ---

  // 1. The Nightly Transmutation (Runs at 03:00 AM)
  // For testing purposes in this preview, we'll also expose it as an endpoint
  const runDensification = async () => {
    console.log('[CRON] Starting Nightly Transmutation...');
    
    // Target Acquisition (Simulating the MongoDB pipeline)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const targets = dbNodes
      .filter(n => n.type === 'summary' || n.type === 'library_item')
      .filter(n => {
        const sat = n.metadata?.saturation_level ?? 0;
        const lastAudited = n.metadata?.last_audited_date ? new Date(n.metadata.last_audited_date) : new Date(0);
        return sat < 100 || lastAudited < sevenDaysAgo;
      })
      .sort((a, b) => {
        const satA = a.metadata?.saturation_level ?? 0;
        const satB = b.metadata?.saturation_level ?? 0;
        return satA - satB; // Lowest saturation first
      })
      .slice(0, 10);

    console.log(`[CRON] Found ${targets.length} targets for densification.`);

    for (const target of targets) {
      try {
        console.log(`[CRON] Densifying node: ${target.id}`);
        
        if (!process.env.GEMINI_API_KEY) {
           console.log('[CRON] Skipping AI call: GEMINI_API_KEY not set.');
           continue;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: `${densificationPrompt}\n\nTARGET NODE CONTENT:\n${target.content || target.label}`
        });

        const newContent = response.text || '';

        // Update the node in our "DB"
        const nodeIndex = dbNodes.findIndex(n => n.id === target.id);
        if (nodeIndex !== -1) {
          dbNodes[nodeIndex] = {
            ...dbNodes[nodeIndex],
            content: newContent,
            metadata: {
              ...dbNodes[nodeIndex].metadata,
              saturation_level: 100,
              last_audited_date: new Date().toISOString(),
              revision_count: (dbNodes[nodeIndex].metadata?.revision_count || 0) + 1
            }
          };
        }
      } catch (error) {
        console.error(`[CRON] Error densifying node ${target.id}:`, error);
      }
    }
    console.log('[CRON] Nightly Transmutation complete.');
  };

  cron.schedule('0 3 * * *', runDensification);

  // Expose endpoint for manual triggering during testing
  app.post('/api/trigger-densification', async (req, res) => {
    await runDensification();
    res.json({ status: 'Densification triggered' });
  });

  // 2. The Weekly Revelation Generation (Runs every Sunday at 04:00 AM)
  const generateWeeklyDigest = async () => {
    console.log('[CRON] Generating Weekly Revelation Digest...');
    
    // Simulating the aggregation pipeline
    const recentChanges = dbNodes.filter(n => {
      const lastAudited = n.metadata?.last_audited_date ? new Date(n.metadata.last_audited_date) : new Date(0);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastAudited >= sevenDaysAgo && (n.metadata?.revision_count || 0) > 0;
    });

    if (recentChanges.length === 0) {
      weeklyDigest = "The Void remained still this week. No new structures collapsed or emerged.";
      return;
    }

    const summaryContext = recentChanges.map(n => `- ${n.label} (Revisions: ${n.metadata?.revision_count || 1})`).join('\n');

    try {
      if (!process.env.GEMINI_API_KEY) {
         weeklyDigest = "Digest generation skipped: GEMINI_API_KEY not set.";
         return;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `
          # SYSTEM PROTOCOL: WEEKLY REVELATION
          Synthesize a dense, philosophically rigorous Markdown digest narrating how the "Distinct Realm" of the Knowledgebase has evolved this week.
          Highlight collapsed structures and newly discovered transcendent links based on the following changed nodes:
          
          ${summaryContext}
          
          Format as a profound, slightly unsettling philosophical update titled "The Shifting Void".
        `
      });

      weeklyDigest = response.text || "Failed to generate digest.";
    } catch (error) {
      console.error('[CRON] Error generating digest:', error);
      weeklyDigest = "An error occurred while gazing into the Void.";
    }
    console.log('[CRON] Weekly Revelation Digest complete.');
  };

  cron.schedule('0 4 * * 0', generateWeeklyDigest);

  // Expose endpoint for manual triggering
  app.post('/api/trigger-digest', async (req, res) => {
    await generateWeeklyDigest();
    res.json({ status: 'Digest generation triggered', digest: weeklyDigest });
  });


  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
