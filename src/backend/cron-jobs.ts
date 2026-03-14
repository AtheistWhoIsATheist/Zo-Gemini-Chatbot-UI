import cron from 'node-cron';
import { getNodesForDensification, getWeeklyChanges, getNodesCollection, getDigestsCollection } from './db';
import { densificationPrompt, revelationDigestPrompt } from './ai-prompts';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder' });

export function startCronJobs() {
  // The Nightly Transmutation (node-cron): Runs at 03:00 AM every day
  cron.schedule('0 3 * * *', async () => {
    console.log('[CRON] Initiating The Nightly Transmutation: Recursive Densification...');
    
    try {
      const nodesCollection = getNodesCollection();
      if (!nodesCollection) return;

      // Target Acquisition
      const targetNodes = await getNodesForDensification();
      console.log(`[CRON] Acquired ${targetNodes.length} nodes for densification.`);

      for (const node of targetNodes) {
        // Recursive Densification
        const prompt = densificationPrompt.replace('{node_data}', JSON.stringify(node));
        
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                expanded_summary: { type: Type.STRING },
                socratic_questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      aporia_state: { type: Type.STRING }
                    },
                    required: ['text', 'aporia_state']
                  }
                },
                ghost_structures_pruned: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['expanded_summary', 'socratic_questions', 'ghost_structures_pruned']
            }
          }
        });

        if (response.text) {
          const result = JSON.parse(response.text);
          
          // Database Update
          await nodesCollection.updateOne(
            { _id: node._id },
            {
              $set: {
                summary: result.expanded_summary,
                socratic_questions: result.socratic_questions,
                saturation_level: 100,
                last_audited_date: new Date()
              },
              $inc: { revision_count: 1 }
            }
          );
          console.log(`[CRON] Densified Node: ${node.label}`);
        }
      }
      console.log('[CRON] Nightly Transmutation Complete.');
    } catch (error) {
      console.error('[CRON] Error during Nightly Transmutation:', error);
    }
  });

  // The Weekly Revelation Generation: Runs at 04:00 AM every Sunday
  cron.schedule('0 4 * * 0', async () => {
    console.log('[CRON] Initiating The Weekly Revelation Generation...');
    
    try {
      const digestsCollection = getDigestsCollection();
      if (!digestsCollection) return;

      // Aggregate all revision_count changes and new Entities
      const weeklyData = await getWeeklyChanges();
      
      const prompt = revelationDigestPrompt.replace('{weekly_data}', JSON.stringify(weeklyData));
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt
      });

      if (response.text) {
        // Save the digest
        await digestsCollection.insertOne({
          date: new Date(),
          content: response.text,
          type: 'weekly_revelation'
        });
        console.log('[CRON] Weekly Revelation Generated and Stored.');
      }
    } catch (error) {
      console.error('[CRON] Error during Weekly Revelation Generation:', error);
    }
  });

  console.log('[SYSTEM] Cron Jobs Registered: Nightly Transmutation (03:00) & Weekly Revelation (Sun 04:00).');
}
