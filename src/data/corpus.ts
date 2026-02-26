export type NodeType = 'treatise' | 'journal' | 'thinker' | 'concept' | 'fragment';

export interface Node {
  id: string;
  label: string;
  type: NodeType;
  content?: string;
}

export interface Link {
  source: string;
  target: string;
  label?: string;
}

export const corpusNodes: Node[] = [
  { id: 'ren', label: 'REN (The Religious Experience of Nihilism)', type: 'treatise', content: '# The Religious Experience of Nihilism\n\nChapter 1: The foundation of nihiltheism lies in the absolute confrontation with the Void. It is not a passive despair, but an active, terrifying encounter with groundlessness. When all structures collapse, what remains is the pure, unmediated presence of nothingness—which, paradoxically, is the only true ground.' },
  { id: 'journal314', label: 'Journal314', type: 'journal', content: '# Journal314\n\n*Entry 42:* Today the realization hit again. The collapse of meaning isn\'t the end; it\'s the prerequisite. We spend our lives building scaffolding over the abyss. Nihiltheism is the act of dismantling the scaffolding while standing on it.' },
  { id: 'cioran', label: 'E.M. Cioran', type: 'thinker', content: '# E.M. Cioran\n\nCioran understood the insomnia of the soul. His aphorisms are not mere pessimism; they are a lucid diagnosis of the human condition. He saw the Void, but perhaps stopped short of finding the divine *within* it.' },
  { id: 'ligotti', label: 'Thomas Ligotti', type: 'thinker', content: '# Thomas Ligotti\n\nLigotti\'s horror is ontological. The nightmare is not monsters, but the realization that we are puppets without a puppeteer. This aligns perfectly with the initial stage of the Nihiltheistic realization: the horror of the mechanism.' },
  { id: 'kierkegaard', label: 'Søren Kierkegaard', type: 'thinker', content: '# Søren Kierkegaard\n\nThe leap of faith. But what if the leap is not into the arms of a loving God, but into the center of the Void itself? The anxiety (Angst) he describes is the dizziness of freedom facing the abyss.' },
  { id: 'nagarjuna', label: 'Nāgārjuna', type: 'thinker', content: '# Nāgārjuna\n\nŚūnyatā (Emptiness). The ultimate truth is that all phenomena are empty of inherent existence. This is the Eastern parallel to the Western Void, but framed not as a tragedy, but as liberation.' },
  { id: 'void', label: 'The Void', type: 'concept', content: '# The Void\n\nThe central axis of Nihiltheism. It is the absence of inherent meaning, structure, or divine guarantee. It is both the terror that induces spiritual emergency and the canvas for true, unconditioned presence.' },
  { id: 'presence', label: 'Presence', type: 'concept', content: '# Presence\n\nWhat emerges when the ego\'s desperate grasp for meaning ceases. It is the fullness found only at the very bottom of the Void. A paradoxical state of being where nothing matters, and therefore everything is infinitely precious.' },
  { id: 'spiritual_emergency', label: 'Spiritual Emergency', type: 'concept', content: '# Spiritual Emergency\n\nThe crisis that occurs when an individual\'s meaning-structures collapse before they are capable of integrating the Void. It can mimic psychosis but is fundamentally an ontological crisis, a birth pang of the Nihiltheistic realization.' },
  { id: 'collapse', label: 'Collapse', type: 'concept', content: '# Collapse\n\nThe necessary destruction of false idols. The dismantling of the ego\'s scaffolding.' },
];

export const corpusLinks: Link[] = [
  { source: 'ren', target: 'void', label: 'explores' },
  { source: 'ren', target: 'presence', label: 'culminates in' },
  { source: 'journal314', target: 'collapse', label: 'documents' },
  { source: 'journal314', target: 'ren', label: 'drafts' },
  { source: 'cioran', target: 'void', label: 'stares into' },
  { source: 'ligotti', target: 'collapse', label: 'fears' },
  { source: 'kierkegaard', target: 'spiritual_emergency', label: 'diagnoses' },
  { source: 'nagarjuna', target: 'void', label: 'liberates through' },
  { source: 'void', target: 'presence', label: 'paradoxically contains' },
  { source: 'collapse', target: 'spiritual_emergency', label: 'triggers' },
  { source: 'spiritual_emergency', target: 'void', label: 'confronts' },
];
