/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NodeType = 'treatise' | 'journal' | 'thinker' | 'concept' | 'fragment' | 'methodology' | 'claim' | 'experience' | 'library_item' | 'summary' | 'question';

export type NodeStatus = 'VERIFIED' | 'INFERENCE' | 'HYPOTHESIS' | 'UNKNOWN' | 'RAW';


export interface VoidBlock {
  id: string;
  type: 'text' | 'code' | 'heading' | 'todo';
  content: string;
  metadata?: {
    lastEdited?: number;
    sentiment?: string;
    checked?: boolean;
    language?: string;
  };
}

export interface Node {
  id: string;
  label: string;
  type: NodeType;
  blocks: VoidBlock[]; // Replaced content string with blocks array
  status?: NodeStatus;
  confidence?: number; // 0.0 to 1.0
  evidence_quote_ids?: string[];
  metadata?: {
    geometry?: 'circle' | 'square' | 'diamond' | 'hex' | 'octagon';
    chromatic_tag?: string;
    url?: string;
    tags?: string[];
    date_added?: string;
    last_audited_date?: string;
    saturation_level?: number;
    revision_count?: number;
    aporia_state?: 'Active' | 'Synthesized' | 'Terminal';
    embedding?: number[];
  };
}

export interface Link {
  source: string;
  target: string;
  label?: string;
  type?: 'explores' | 'culminates' | 'documents' | 'triggers' | 'confronts' | 'paradox' | 'objection';
}

const createBlock = (content: string): VoidBlock => ({
  id: `blk_${Math.random().toString(36).substr(2, 9)}`,
  type: 'text',
  content,
  metadata: { lastEdited: Date.now(), sentiment: 'neutral' }
});

export const corpusNodes: Node[] = [
  { 
    id: 'ren', 
    label: 'REN (The Religious Experience of Nihilism)', 
    type: 'treatise', 
    status: 'VERIFIED',
    confidence: 1.0,
    blocks: [createBlock('# The Religious Experience of Nihilism\n\nChapter 1: The foundation of nihiltheism lies in the absolute confrontation with the Void. It is not a passive despair, but an active, terrifying encounter with groundlessness. When all structures collapse, what remains is the pure, unmediated presence of nothingness—which, paradoxically, is the only true ground.')],
    metadata: { geometry: 'octagon', chromatic_tag: 'methodology_accent_1' }
  },
  { 
    id: 'journal314', 
    label: 'Journal314', 
    type: 'journal', 
    status: 'VERIFIED',
    confidence: 0.95,
    blocks: [createBlock('# Journal314\n\n*Entry 42:* Today the realization hit again. The collapse of meaning isn\'t the end; it\'s the prerequisite. We spend our lives building scaffolding over the abyss. Nihiltheism is the act of dismantling the scaffolding while standing on it.')],
    metadata: { geometry: 'hex' }
  },
  { 
    id: 'cioran', 
    label: 'E.M. Cioran', 
    type: 'thinker', 
    status: 'VERIFIED',
    confidence: 0.9,
    blocks: [createBlock('# E.M. Cioran\n\nCioran understood the insomnia of the soul. His aphorisms are not mere pessimism; they are a lucid diagnosis of the human condition. He saw the Void, but perhaps stopped short of finding the divine *within* it.')],
    metadata: { geometry: 'diamond' }
  },
  { 
    id: 'ligotti', 
    label: 'Thomas Ligotti', 
    type: 'thinker', 
    status: 'VERIFIED',
    confidence: 0.85,
    blocks: [createBlock('# Thomas Ligotti\n\nLigotti\'s horror is ontological. The nightmare is not monsters, but the realization that we are puppets without a puppeteer. This aligns perfectly with the initial stage of the Nihiltheistic realization: the horror of the mechanism.')],
    metadata: { geometry: 'diamond' }
  },
  { 
    id: 'kierkegaard', 
    label: 'Søren Kierkegaard', 
    type: 'thinker', 
    status: 'VERIFIED',
    confidence: 0.8,
    blocks: [createBlock('# Søren Kierkegaard\n\nThe leap of faith. But what if the leap is not into the arms of a loving God, but into the center of the Void itself? The anxiety (Angst) he describes is the dizziness of freedom facing the abyss.')],
    metadata: { geometry: 'diamond' }
  },
  { 
    id: 'nagarjuna', 
    label: 'Nāgārjuna', 
    type: 'thinker', 
    status: 'VERIFIED',
    confidence: 0.9,
    blocks: [createBlock('# Nāgārjuna\n\nŚūnyatā (Emptiness). The ultimate truth is that all phenomena are empty of inherent existence. This is the Eastern parallel to the Western Void, but framed not as a tragedy, but as liberation.')],
    metadata: { geometry: 'diamond' }
  },
  { 
    id: 'void', 
    label: 'The Void', 
    type: 'concept', 
    status: 'VERIFIED',
    confidence: 1.0,
    blocks: [createBlock('# The Void\n\nThe central axis of Nihiltheism. It is the absence of inherent meaning, structure, or divine guarantee. It is both the terror that induces spiritual emergency and the canvas for true, unconditioned presence.')],
    metadata: { geometry: 'circle', chromatic_tag: 'void_primary' }
  },
  { 
    id: 'presence', 
    label: 'Presence', 
    type: 'concept', 
    status: 'INFERENCE',
    confidence: 0.7,
    blocks: [createBlock('# Presence\n\nWhat emerges when the ego\'s desperate grasp for meaning ceases. It is the fullness found only at the very bottom of the Void. A paradoxical state of being where nothing matters, and therefore everything is infinitely precious.')],
    metadata: { geometry: 'circle' }
  },
  { 
    id: 'spiritual_emergency', 
    label: 'Spiritual Emergency', 
    type: 'experience', 
    status: 'VERIFIED',
    confidence: 0.85,
    blocks: [createBlock('# Spiritual Emergency\n\nThe crisis that occurs when an individual\'s meaning-structures collapse before they are capable of integrating the Void. It can mimic psychosis but is fundamentally an ontological crisis, a birth pang of the Nihiltheistic realization.\n\n**BOUNDARY NOTE**: This is a phenomenological state, not a clinical diagnosis.')],
    metadata: { geometry: 'square' }
  },
  { 
    id: 'collapse', 
    label: 'Collapse', 
    type: 'concept', 
    status: 'VERIFIED',
    confidence: 0.9,
    blocks: [createBlock('# Collapse\n\nThe necessary destruction of false idols. The dismantling of the ego\'s scaffolding.')],
    metadata: { geometry: 'hex' }
  },
  {
    id: 'anpes',
    label: 'ANPES Engine',
    type: 'methodology',
    status: 'VERIFIED',
    confidence: 1.0,
    blocks: [createBlock('# ANPES (Advanced Nihiltheistic Prompt Engineering System)\n\nThe meta-cognitive engine that transforms Nihiltheistic philosophy into executable protocols. It maintains paradox without collapse.')],
    metadata: { geometry: 'octagon', chromatic_tag: 'methodology_accent_2' }
  },
  // --- NEW KNOWLEDGE CURATOR ENGINE DATA ---
  {
    id: 'lib_001',
    label: 'The Architecture of Absence',
    type: 'library_item',
    status: 'RAW',
    blocks: [createBlock('A deep-dive video essay exploring the spatial representation of the Void in modern architecture.')],
    metadata: { url: 'https://example.com/void-arch', tags: ['architecture', 'void', 'spatiality'], date_added: '2026-02-28', geometry: 'square' }
  },
  {
    id: 'sum_001',
    label: 'Summary: Spatial Void',
    type: 'summary',
    status: 'INFERENCE',
    confidence: 0.8,
    blocks: [createBlock('The spatial void is not an empty room, but a room that *contains* emptiness as a structural member. Architecture becomes the frame for the unframeable.')],
    evidence_quote_ids: ['lib_001'],
    metadata: { tags: ['transcendent', 'framing'], geometry: 'hex' }
  },
  {
    id: 'q_001',
    label: 'Can the Void be inhabited?',
    type: 'question',
    status: 'HYPOTHESIS',
    blocks: [createBlock('If the Void is the only true ground, does habitation imply a re-imposition of scaffolding, or a new mode of groundless being?')],
    metadata: { tags: ['habitation', 'ontology'], geometry: 'diamond' }
  }
];

export const corpusLinks: Link[] = [
  { source: 'ren', target: 'void', label: 'explores', type: 'explores' },
  { source: 'ren', target: 'presence', label: 'culminates in', type: 'culminates' },
  { source: 'journal314', target: 'collapse', label: 'documents', type: 'documents' },
  { source: 'journal314', target: 'ren', label: 'drafts', type: 'documents' },
  { source: 'cioran', target: 'void', label: 'stares into', type: 'explores' },
  { source: 'ligotti', target: 'collapse', label: 'fears', type: 'triggers' },
  { source: 'kierkegaard', target: 'spiritual_emergency', label: 'diagnoses', type: 'confronts' },
  { source: 'nagarjuna', target: 'void', label: 'liberates through', type: 'explores' },
  { source: 'void', target: 'presence', label: 'paradoxically contains', type: 'paradox' },
  { source: 'collapse', target: 'spiritual_emergency', label: 'triggers', type: 'triggers' },
  { source: 'spiritual_emergency', target: 'void', label: 'confronts', type: 'confronts' },
  { source: 'anpes', target: 'ren', label: 'operationalizes', type: 'explores' },
  { source: 'lib_001', target: 'sum_001', label: 'distilled into' },
  { source: 'sum_001', target: 'q_001', label: 'prompts' },
  { source: 'q_001', target: 'void', label: 'interrogates' }
];
