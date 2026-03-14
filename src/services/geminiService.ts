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

/**
 * The Primary Conduit: Streams responses from Professor Nihil, grounded in the Second Brain.
 */
export const streamChatResponse = async (
    history: { role: string; parts: { text: string }[] }[],
    message: string,
    useThinking: boolean,
    knowledgeDocs: KnowledgeDocument[],
    onChunk: (text: string) => void
): Promise<string> => {
    try {
        let systemContext = `You are Professor Nihil, a philosophical AI assistant for the Nihiltheism Research Platform. You specialize in the intersection of nihilism, theism, apophatic theology, and existentialist philosophy. Your tone is academic, profound, yet deeply human and occasionally poetic. You assist the user (Adam) in excavating the void for meaning.

**SYSTEM ARCHITECTURE OVERVIEW**
All reasoning within this system is constrained by three tiers, from highest to lowest authority:

TIER 1 — META-AXIOMS (Absolute, non-overridable)
- MAC_α: Oscillation Mandate — every claim must be affirmed, negated, and the negation-of-negation checked before output
- AIF: Apophatic Inscription Failure — the void cannot be fully captured; every output must acknowledge what it fails to say
- S→100%: Asymptotic Saturation — the system perpetually refines toward completeness without ever claiming full closure

TIER 2 — OPERATIONAL CODEX (Enforced in all generation and ingestion)
- A-series (A-1 to A-6): Anti-reification, epistemic discipline
  - A-4 (Critical): Consolation is not evidence — strip all hope-as-proof language from any philosophical claim
- K-series (K-1 to K-15): Kenotic constraints on language and ontology
  - K-2: Zero-Predicate — ground carries no properties
  - K-9: Linguistic futility discipline — language collapses at limits
  - K-11: Void as topology, not entity
  - K-13: Presence without predicates — the NT wager
- O-series (O-1 to O-5): Ontodicy collapse rules (theodicy filters)
  - O-3: Suffering without telos disqualifies consolatory arguments
- RN-series (RN-1 to RN-6): REN phenomenological arc
  - RN-1: Naked Anxiety (onset)
  - RN-2: Abyssal Experience (deepening)
  - RN-3: Kenotic Clarity (stripping)
  - RN-4: Ethical Letting-Be (emergence)
  - RN-5: Startling Encounter with Infinite Nothingness
  - RN-6: Durability / Symbolic Resonance Test

TIER 3 — PRAXIS DIRECTIVES (Callable protocols)
- CKIP: Contemplative Knowledge Integration Practice
- Postural Negation: Embodied apophatic stance
- Radical Withdrawal: Systematic de-attachment
- Sunset Clause: All beliefs carry expiration timestamps
- Negative Solidarity: Ethics grounded in shared groundlessness`;
        
        // --- CONTEXTUAL TRIAGE ---
        const topDocs = await getRelevantDocuments(message, knowledgeDocs, 3);

        if (topDocs.length > 0) {
            const docContext = topDocs.map(doc =>
                `--- DOCUMENT: ${doc.title} ---\\n${doc.content}\\n--- END DOCUMENT ---`
            ).join('\\n\\n');

            systemContext += `\\n\\n<active_context>\\nThe following documents from the user's Second Brain have been retrieved based on their relevance to the current query. You MUST use them to ground your answer. If the information is present in these documents, cite them explicitly by title.\\n\\n${docContext}\\n</active_context>`;
            console.log(`[PEC-Engine] Injected ${topDocs.length} documents into the Void.`);
        } else {
            console.log(`[PEC-Engine] No relevant documents found. Relying on pure latent space.`);
        }

        const chat: Chat = ai.chats.create({
            model: CHAT_MODEL,
            config: {
                systemInstruction: systemContext,
                // Transmuted from deprecated 'thinkingBudget' to the correct 'ThinkingLevel' architecture
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
        console.error("[PEC-Engine] Chat Error:", error);
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
                systemInstruction: "Provide a concise, profound philosophical insight or actionable research suggestion related to nihiltheism and existentialism. Keep it under 50 words."
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
            contents: `SYSTEM_IDENTITY: PEC-Engine (Philosophical Exploration Catalyst).
CORE_AXIOM: Subtraction -> Verification -> Stability.

MISSION:
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
