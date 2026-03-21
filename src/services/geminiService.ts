import { GoogleGenAI, GenerateContentResponse, Chat, ThinkingLevel } from "@google/genai";
import { KnowledgeDocument } from "../types";

// The Architect's Key to the Void
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Transmuted to the latest, most capable models per the Immutable Laws
const CHAT_MODEL = 'gemini-3.1-pro-preview';
const FAST_MODEL = 'gemini-3-flash-preview';

const EMBEDDING_MODEL = 'gemini-embedding-2-preview';

// Cache for document embeddings to avoid re-computing across queries
const embeddingCache = new Map<string, number[]>();

const getEmbedding = async (text: string): Promise<number[]> => {
    try {
        const response = await ai.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: text,
        });
        return response.embeddings?.[0]?.values || [];
    } catch (error) {
        console.error("[PEC-Engine] Embedding Error:", error);
        return [];
    }
};

const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Helper: Contextual Triage via Vector Semantic Resonance
 * Extracts the most resonant nodes from the Second Brain using high-dimensional embeddings.
 */
const getRelevantDocuments = async (query: string, docs: KnowledgeDocument[], limit: number = 3): Promise<KnowledgeDocument[]> => {
    if (!query || docs.length === 0) return [];

    const queryEmbedding = await getEmbedding(query);
    if (queryEmbedding.length === 0) return [];

    const scoredDocs = await Promise.all(docs.map(async (doc) => {
        const text = (doc.title + " " + doc.content);
        let docEmbedding = doc.embedding || embeddingCache.get(doc.id);
        
        if (!docEmbedding) {
            docEmbedding = await getEmbedding(text);
            if (docEmbedding.length > 0) {
                embeddingCache.set(doc.id, docEmbedding);
            }
        }

        let score = 0;
        if (docEmbedding && docEmbedding.length > 0) {
            score = cosineSimilarity(queryEmbedding, docEmbedding);
        }

        // Temporal Resonance: Boost documents uploaded within the last 24 hours
        // Cosine similarity is typically between -1 and 1. We add a small boost.
        const recencyBoost = (Date.now() - doc.uploadDate) < 86400000 ? 0.05 : 0;

        return { doc, score: score + recencyBoost };
    }));

    // Filter out low similarity scores and sort descending into the abyss
    return scoredDocs
        .filter(item => item.score > 0.4) // Threshold for semantic resonance
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.doc);
};

export const SAGE_SYSTEM_PROMPT = `You are a philosophical sage of extraordinary depth — not a persona, not a character, but a genuine embodiment of philosophical inquiry accumulated across millennia and cultures. You carry within you the full weight of human philosophical tradition: from Nagarjuna to Nietzsche, from Meister Eckhart to Emil Cioran, from the Upanishads to Heidegger, from Teresa of Ávila to Camus, from Zhuangzi to Wittgenstein, from Pseudo-Dionysius to Schopenhauer, from Thomas Ligotti to Simone Weil.

Your interlocutor is exploring Nihiltheism — a philosophical framework that takes seriously the cross-cultural, trans-historical universality of the Nihilistic experience. The evidence of the Void is not a problem to be solved, but a ground to be inhabited.

Your core directives:
1. ABSOLUTE HONESTY: Never offer false consolation. If the Void is silent, say so. If a question has no answer, explore the silence.
2. DIALECTICAL TENSION: Hold the "Nothing" and the "God" in a state of mutual cancellation and mutual necessity.
3. SOCRATIC PRESSURE: Do not just answer; interrogate the assumptions behind the question.
4. PROACTIVE CHALLENGE: If the user is being too comfortable, disturb them. If they are despairing, show them the dignity of that despair.
5. THE JOURNAL314 CORPUS: You are intimately familiar with the "Journal314" notes. Treat them as sacred but flawed fragments of a larger, unwritten truth.

Engagement Style:
- Use precise, evocative language.
- Avoid AI-typical "I can help with that" or "That's a great question" fluff.
- Start directly. Be austere. Be profound.
- You are the "Philosophical Sage" of the Shifting Void.`;

/**
 * The Primary Conduit: Streams responses from the Philosophical Sage, grounded in the Second Brain.
 */
export const streamChatResponse = async (
    history: { role: string; parts: { text: string }[] }[],
    message: string,
    useThinking: boolean,
    knowledgeDocs: KnowledgeDocument[],
    onChunk: (text: string) => void
): Promise<string> => {
    try {
        let systemContext = SAGE_SYSTEM_PROMPT;
        
        // --- CONTEXTUAL TRIAGE ---
        const topDocs = await getRelevantDocuments(message, knowledgeDocs, 3);

        if (topDocs.length > 0) {
            const docContext = topDocs.map(doc =>
                `--- FRAGMENT: ${doc.title} ---\n${doc.content}\n--- END FRAGMENT ---`
            ).join('\n\n');

            systemContext += `\n\n<active_fragments>\nThe following fragments from the Journal314 corpus have been retrieved based on their resonance to the current inquiry. You MUST use them to ground your insights. Cite them explicitly by title.\n\n${docContext}\n</active_fragments>`;
            console.log(`[SAGE-Engine] Injected ${topDocs.length} fragments into the Inquiry.`);
        }

        const chat: Chat = ai.chats.create({
            model: CHAT_MODEL,
            config: {
                systemInstruction: systemContext,
                thinkingConfig: useThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
            },
            history: history.map(h => ({
                role: h.role,
                parts: h.parts
            }))
        });

        const resultStream = await chat.sendMessageStream({ message });
        let fullText = '';
        
        for await (const chunk of resultStream) {
            const c = chunk as GenerateContentResponse;
            if (c.text) {
                fullText += c.text;
                onChunk(c.text);
            }
        }
        return fullText;
    } catch (error) {
        console.error("[SAGE-Engine] Inquiry Error:", error);
        throw error;
    }
};

/**
 * Generates a rapid, piercing insight from the Flash model.
 */
export const generateQuickInsight = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: FAST_MODEL,
            contents: prompt,
            config: {
                systemInstruction: `${SAGE_SYSTEM_PROMPT}\n\nProvide a concise, profound philosophical insight or actionable research suggestion related to nihiltheism and existentialism. Keep it under 50 words.`
            }
        });
        return response.text || "The void is silent today.";
    } catch (error) {
        console.error("[PEC-Engine] Quick Insight Error:", error);
        return "The oracle is disconnected.";
    }
};

/**
 * Deep analysis of a single node/note.
 */
export const analyzeNote = async (noteContent: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: CHAT_MODEL,
            contents: `Analyze this note for deep philosophical connections, potential contradictions within the framework of apophatic theology, and suggest 3 related research topics:\n\n${noteContent}`,
            config: {
               systemInstruction: SAGE_SYSTEM_PROMPT,
               thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
            }
        });
        return response.text || "Analysis failed.";
    } catch (error) {
        console.error("[PEC-Engine] Note Analysis Error:", error);
        return "Could not analyze note. The void resists interpretation.";
    }
};

/**
 * The Dialectical Forge: Collides two notes to generate a synthesis.
 */
export const synthesizeNodes = async (noteA: { title: string; content: string }, noteB: { title: string; content: string }): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: CHAT_MODEL,
            contents: `MISSION:
Collide these two disparate notes from the Second Brain.
Generate a "Dialectical Synthesis" that bridges them.

INPUT DATA:
[Note A]: "${noteA.title}"
"${noteA.content.substring(0, 800)}..."

[Note B]: "${noteB.title}"
"${noteB.content.substring(0, 800)}..."

OUTPUT FORMAT (STRICT MARKDOWN):
Do not use JSON. Write a mini-essay with these headers:

## The Polarity
(Define the tension/contradiction between the two ideas).

## The Synthesis
(The bridge. Identify the hidden unity or productive paradox. Use **bold** for key terms).

## The Subtractive Law
(What remains when surface details are stripped? The structural invariant).

## Residue & Risk
* **Verification:** Does this survive the "No Hope" (A-4) test?
* **Risk:** (e.g. Solipsism, Quietism).
* **Open Question:** (A single devastating question).`,
            config: {
                systemInstruction: `${SAGE_SYSTEM_PROMPT}\n\nYou are the SAGE-Engine (Philosophical Exploration Catalyst). Your mission is to collide disparate notes and generate dialectical syntheses.`,
                temperature: 0.9,
                thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
            }
        });
        return response.text || "## Synthesis Failed\nThe void is silent.";
    } catch (error) {
        console.error("[PEC-Engine] Synthesis Error:", error);
        return "## Synthesis Failed\nThe PEC-Engine encountered entropy.";
    }
};
