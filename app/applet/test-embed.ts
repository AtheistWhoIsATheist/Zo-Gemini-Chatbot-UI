import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const res = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: 'hello world'
  });
  console.log(res.embeddings?.[0]?.values?.length);
}
run().catch(console.error);
