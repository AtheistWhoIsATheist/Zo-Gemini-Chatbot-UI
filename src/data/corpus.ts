/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NodeType =
  | "treatise"
  | "journal"
  | "thinker"
  | "concept"
  | "fragment"
  | "methodology"
  | "claim"
  | "experience"
  | "library_item"
  | "summary"
  | "question"
  | "praxis"
  | "axiom";

export type NodeStatus =
  | "VERIFIED"
  | "INFERENCE"
  | "HYPOTHESIS"
  | "UNKNOWN"
  | "RAW";

export interface VoidBlock {
  id: string;
  type: "text" | "code" | "heading" | "todo";
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
  blocks: VoidBlock[];
  status?: NodeStatus;
  confidence?: number;
  evidence_quote_ids?: string[];
  metadata?: {
    geometry?: "circle" | "square" | "diamond" | "hex" | "octagon";
    chromatic_tag?: string;
    url?: string;
    tags?: string[];
    date_added?: string;
    last_audited_date?: string;
    saturation_level?: number;
    revision_count?: number;
    aporia_state?: "Active" | "Synthesized" | "Terminal";
    embedding?: number[];
  };
}

export interface Link {
  source: string;
  target: string;
  label?: string;
  type?:
    | "explores"
    | "culminates"
    | "documents"
    | "triggers"
    | "confronts"
    | "paradox"
    | "objection";
}

const createBlock = (content: string): VoidBlock => ({
  id: `blk_${Math.random().toString(36).substr(2, 9)}`,
  type: "text",
  content,
  metadata: { lastEdited: Date.now(), sentiment: "neutral" },
});

export const corpusNodes: Node[] = [
  {
    id: "mac_alpha",
    label: "MAC_α (Minimum Apophatic Condition)",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock("The Minimum Apophatic Condition (MAC_α) states that any valid nihiltheistic assertion must first pass through the negation of all positive theological and philosophical constructs before it can point to the generative Void.")
    ],
    metadata: { tags: ["axiom", "apophasis", "void"] }
  },
  {
    id: "aif",
    label: "AIF (Abyssal Integration Factor)",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock("The Abyssal Integration Factor (AIF) measures the degree to which an individual or system has integrated the reality of groundlessness into their operational framework without collapsing into passive nihilism.")
    ],
    metadata: { tags: ["axiom", "integration", "abyss"] }
  },
  {
    id: "s_100",
    label: "S→100% (Total Semantic Saturation)",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock("S→100% represents the theoretical limit where all nodes in the knowledge graph achieve total semantic saturation, meaning every concept is fully cross-referenced, densified, and integrated into the overarching ontology.")
    ],
    metadata: { tags: ["axiom", "saturation", "system"] }
  },
  {
    id: "codex_a",
    label: "A-Series (Apophatic Operations)",
    type: "methodology",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock("The A-Series defines the operational protocols for apophatic inquiry, focusing on the systematic dismantling of linguistic and conceptual idols to reveal the underlying Void.")
    ],
    metadata: { tags: ["codex", "apophasis", "operations"] }
  },
  {
    id: "codex_k",
    label: "K-Series (Kenotic Operations)",
    type: "methodology",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock("The K-Series outlines the practices of self-emptying (kenosis), providing a framework for the individual to align their internal state with the ontological reality of groundlessness.")
    ],
    metadata: { tags: ["codex", "kenosis", "operations"] }
  },
  {
    id: "codex_o",
    label: "O-Series (Ontological Operations)",
    type: "methodology",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock("The O-Series governs the mapping and navigation of the ontological landscape, specifically the transition from the collapse of meaning to the encounter with the Sacred Absence.")
    ],
    metadata: { tags: ["codex", "ontology", "operations"] }
  },
  {
    id: "codex_rn",
    label: "RN-Series (Radical Negation Operations)",
    type: "methodology",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock("The RN-Series details the extreme protocols for Radical Negation, employed when standard apophatic methods fail to break through entrenched dogmatic or nihilistic structures.")
    ],
    metadata: { tags: ["codex", "negation", "operations"] }
  },
  {
    id: "praxis_ckip",
    label: "CKIP (Continuous Kenotic Integration Protocol)",
    type: "praxis",
    status: "VERIFIED",
    confidence: 0.95,
    blocks: [
      createBlock("CKIP is the daily practice of identifying and releasing attachments to meaning-structures, ensuring a continuous state of kenotic openness to the Void.")
    ],
    metadata: { tags: ["praxis", "kenosis", "integration"] }
  },
  {
    id: "praxis_postural_negation",
    label: "Postural Negation",
    type: "praxis",
    status: "VERIFIED",
    confidence: 0.95,
    blocks: [
      createBlock("An embodied practice where physical posture and spatial orientation are used to mirror and induce the psychological state of apophasis and surrender to groundlessness.")
    ],
    metadata: { tags: ["praxis", "embodiment", "negation"] }
  },
  {
    id: "praxis_radical_withdrawal",
    label: "Radical Withdrawal",
    type: "praxis",
    status: "VERIFIED",
    confidence: 0.95,
    blocks: [
      createBlock("A strategic, temporary disengagement from all social, linguistic, and conceptual networks to experience the unmediated weight of the Void, resetting the AIF.")
    ],
    metadata: { tags: ["praxis", "withdrawal", "void"] }
  },
  {
    id: "praxis_sunset_clause",
    label: "Sunset Clause",
    type: "praxis",
    status: "VERIFIED",
    confidence: 0.95,
    blocks: [
      createBlock("The mandatory, built-in obsolescence of any newly constructed meaning-framework, ensuring that no concept solidifies into an idol. All structures must eventually be subjected to the A-Series.")
    ],
    metadata: { tags: ["praxis", "impermanence", "system"] }
  },
  {
    id: "praxis_negative_solidarity",
    label: "Negative Solidarity",
    type: "praxis",
    status: "VERIFIED",
    confidence: 0.95,
    blocks: [
      createBlock("The formation of community not around shared beliefs or positive identities, but around the shared experience of existential rupture and the mutual recognition of the Void.")
    ],
    metadata: { tags: ["praxis", "community", "rupture"] }
  },
  {
    id: "ren",
    label: "REN (The Religious Experience of Nihilism)",
    type: "treatise",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# The Religious Experience of Nihilism\n\nChapter 1: The foundation of nihiltheism lies in the absolute confrontation with the Void. It is not a passive despair, but an active, terrifying encounter with groundlessness. When all structures collapse, what remains is the pure, unmediated presence of nothingness—which, paradoxically, is the only true ground.",
      ),
    ],
    metadata: {
      geometry: "octagon",
      chromatic_tag: "methodology_accent_1",
      tags: ["void", "presence"],
    },
  },
  {
    id: "journal314",
    label: "Journal314 (The 52 Thinkers)",
    type: "journal",
    status: "VERIFIED",
    confidence: 0.95,
    blocks: [
      createBlock(
        "# Journal314\n\nA massive phenomenological mapping of 52 different thinkers spanning centuries. The sheer volume of dense, abstract text forms a labyrinth of modern thought. This journal seeks the Unified Voice across historically opposed traditions.",
      ),
    ],
    metadata: { geometry: "hex", tags: ["phenomenology", "mapping"] },
  },
  {
    id: "cioran",
    label: "E.M. Cioran",
    type: "thinker",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock(
        "# E.M. Cioran\n\nCioran understood the insomnia of the soul. His aphorisms are not mere pessimism; they are a lucid diagnosis of the human condition. He saw the Void, but perhaps stopped short of finding the divine *within* it.",
      ),
    ],
    metadata: { geometry: "diamond", tags: ["void", "despair"] },
  },
  {
    id: "ligotti",
    label: "Thomas Ligotti",
    type: "thinker",
    status: "VERIFIED",
    confidence: 0.85,
    blocks: [
      createBlock(
        "# Thomas Ligotti\n\nLigotti's horror is ontological. The nightmare is not monsters, but the realization that we are puppets without a puppeteer. This aligns perfectly with the initial stage of the Nihiltheistic realization: the horror of the mechanism.",
      ),
    ],
    metadata: { geometry: "diamond", tags: ["horror", "mechanism"] },
  },
  {
    id: "kierkegaard",
    label: "Søren Kierkegaard",
    type: "thinker",
    status: "VERIFIED",
    confidence: 0.8,
    blocks: [
      createBlock(
        "# Søren Kierkegaard\n\nThe leap of faith. But what if the leap is not into the arms of a loving God, but into the center of the Void itself? The anxiety (Angst) he describes is the dizziness of freedom facing the abyss.",
      ),
    ],
    metadata: { geometry: "diamond", tags: ["angst", "faith"] },
  },
  {
    id: "nagarjuna",
    label: "Nāgārjuna",
    type: "thinker",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock(
        "# Nāgārjuna\n\nŚūnyatā (Emptiness). The ultimate truth is that all phenomena are empty of inherent existence. This is the Eastern parallel to the Western Void, but framed not as a tragedy, but as liberation.",
      ),
    ],
    metadata: { geometry: "diamond", tags: ["emptiness", "liberation"] },
  },
  {
    id: "void",
    label: "The Void",
    type: "concept",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# The Void\n\nThe central axis of Nihiltheism. It is the absence of inherent meaning, structure, or divine guarantee. It is both the terror that induces spiritual emergency and the canvas for true, unconditioned presence.",
      ),
    ],
    metadata: {
      geometry: "circle",
      chromatic_tag: "void_primary",
      tags: ["void", "absence"],
    },
  },
  {
    id: "presence",
    label: "Presence",
    type: "concept",
    status: "INFERENCE",
    confidence: 0.7,
    blocks: [
      createBlock(
        "# Presence\n\nWhat emerges when the ego's desperate grasp for meaning ceases. It is the fullness found only at the very bottom of the Void. A paradoxical state of being where nothing matters, and therefore everything is infinitely precious.",
      ),
    ],
    metadata: { geometry: "circle", tags: ["presence", "fullness"] },
  },
  {
    id: "spiritual_emergency",
    label: "Spiritual Emergency",
    type: "experience",
    status: "VERIFIED",
    confidence: 0.85,
    blocks: [
      createBlock(
        "# Spiritual Emergency\n\nThe crisis that occurs when an individual's meaning-structures collapse before they are capable of integrating the Void. It can mimic psychosis but is fundamentally an ontological crisis, a birth pang of the Nihiltheistic realization.\n\n**BOUNDARY NOTE**: This is a phenomenological state, not a clinical diagnosis.",
      ),
    ],
    metadata: { geometry: "square", tags: ["crisis", "collapse"] },
  },
  {
    id: "collapse",
    label: "Collapse",
    type: "concept",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock(
        "# Collapse\n\nThe necessary destruction of false idols. The dismantling of the ego's scaffolding.",
      ),
    ],
    metadata: { geometry: "hex", tags: ["collapse", "destruction"] },
  },
  {
    id: "anpes",
    label: "ANPES Engine",
    type: "methodology",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# ANPES (Advanced Nihiltheistic Prompt Engineering System)\n\nThe meta-cognitive engine that transforms Nihiltheistic philosophy into executable protocols. It maintains paradox without collapse.",
      ),
    ],
    metadata: {
      geometry: "octagon",
      chromatic_tag: "methodology_accent_2",
      tags: ["methodology", "engine"],
    },
  },
  {
    id: "existential_emptiness",
    label: "Existential Emptiness",
    type: "concept",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock(
        "# Existential Emptiness\n\nThe modern, secular experience of meaninglessness. Often pathologized, but structurally identical to the initial stages of apophatic descent.",
      ),
    ],
    metadata: { geometry: "circle", tags: ["phenomenology"] },
  },
  {
    id: "mystical_experience",
    label: "Mystical Experience",
    type: "experience",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock(
        "# Mystical Experience\n\nThe direct, unmediated encounter with the Absolute. In the Nihiltheistic framework, this is achieved not through addition of dogma, but through the absolute subtraction of all constructs.",
      ),
    ],
    metadata: { geometry: "square", tags: ["phenomenology"] },
  },
  {
    id: "lib_001",
    label: "The Architecture of Absence",
    type: "library_item",
    status: "RAW",
    blocks: [
      createBlock(
        "A deep-dive video essay exploring the spatial representation of the Void in modern architecture.",
      ),
    ],
    metadata: {
      url: "https://example.com/void-arch",
      tags: ["architecture", "void", "spatiality"],
      date_added: "2026-02-28",
      geometry: "square",
    },
  },
  {
    id: "sum_001",
    label: "Summary: Spatial Void",
    type: "summary",
    status: "INFERENCE",
    confidence: 0.8,
    blocks: [
      createBlock(
        "The spatial void is not an empty room, but a room that *contains* emptiness as a structural member. Architecture becomes the frame for the unframeable.",
      ),
    ],
    evidence_quote_ids: ["lib_001"],
    metadata: { tags: ["transcendent", "framing"], geometry: "hex" },
  },
  {
    id: "q_001",
    label: "Can the Void be inhabited?",
    type: "question",
    status: "HYPOTHESIS",
    blocks: [
      createBlock(
        "If the Void is the only true ground, does habitation imply a re-imposition of scaffolding, or a new mode of groundless being?",
      ),
    ],
    metadata: { tags: ["habitation", "ontology"], geometry: "diamond" },
  },
  {
    id: "saturation_100",
    label: "100% Saturation",
    type: "concept",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# 100% Saturation\n\nA multi-axis criterion for completeness. Achieved when no new entities or properties emerge, relationships are stable, scope is exhaustively covered, finer granularity yields only sub-variants, the global model is coherent, and application to new cases is reproducible."
      )
    ],
    metadata: { geometry: "circle", tags: ["saturation", "completeness"] }
  },
  {
    id: "densification_protocol",
    label: "Intensive Iterative Densification Protocol",
    type: "methodology",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# Intensive Iterative Densification Protocol\n\nA recursive process to exhaustively detail all key entities and aspects down to a granular level of surgical precision. Cycles continue until no new material is produced, achieving 100% saturation."
      )
    ],
    metadata: { geometry: "octagon", tags: ["protocol", "densification"] }
  },
  {
    id: "omega_audit_zenith",
    label: "OMEGA-AUDIT-ZENITH",
    type: "methodology",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# OMEGA-AUDIT-ZENITH Protocol\n\nThe governing protocol for the Knowledge Curator Agent, dictating the execution of the Intensive Iterative Densification Protocol."
      )
    ],
    metadata: { geometry: "octagon", tags: ["protocol", "governance"] }
  },
  {
    id: "ghost_structures",
    label: "Ghost Structures",
    type: "concept",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock(
        "# Ghost Structures\n\nWeak, redundant, or vestigial concepts that must be identified and pruned during the densification process to maintain structural integrity."
      )
    ],
    metadata: { geometry: "hex", tags: ["pruning", "redundancy"] }
  },
  {
    id: "terminal_aporias",
    label: "Terminal Aporias",
    type: "concept",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# Terminal Aporias\n\nSocratic questions that push the boundary of current understanding toward the Void, representing the absolute limits of conceptualization."
      )
    ],
    metadata: { geometry: "diamond", tags: ["aporia", "limits"] }
  },
  {
    id: "mac_alpha_2",
    label: "MAC_α: Oscillation Mandate",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# MAC_α: Oscillation Mandate\n\nTier 1 Meta-Axiom. Every claim must be affirmed, negated, and the negation-of-negation checked before output."
      )
    ],
    metadata: { geometry: "square", tags: ["axiom", "oscillation"] }
  },
  {
    id: "aif_2",
    label: "AIF: Apophatic Inscription Failure",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# AIF: Apophatic Inscription Failure\n\nTier 1 Meta-Axiom. The void cannot be fully captured; every output must acknowledge what it fails to say."
      )
    ],
    metadata: { geometry: "square", tags: ["axiom", "apophasis"] }
  },
  {
    id: "s_100_2",
    label: "S→100%: Asymptotic Saturation",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# S→100%: Asymptotic Saturation\n\nTier 1 Meta-Axiom. The system perpetually refines toward completeness without ever claiming full closure."
      )
    ],
    metadata: { geometry: "square", tags: ["axiom", "saturation"] }
  },
  {
    id: "a_series",
    label: "A-series: Anti-reification",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# A-series: Anti-reification\n\nTier 2 Operational Codex. Epistemic discipline.\n\n* **A-1:** Deny the impulse to solidify the Void into a 'thing'.\n* **A-2:** Reject positive theological attributes applied to the ground.\n* **A-3:** Maintain the tension of the paradox without resolving it.\n* **A-4 (Critical):** Consolation is not evidence — strip all hope-as-proof language from any philosophical claim.\n* **A-5:** The map is not the territory; the graph is not the Void.\n* **A-6:** Embrace epistemic humility in the face of the Absolute."
      )
    ],
    metadata: { geometry: "square", tags: ["codex", "anti-reification"] }
  },
  {
    id: "k_series",
    label: "K-series: Kenotic constraints",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# K-series: Kenotic constraints\n\nTier 2 Operational Codex. Constraints on language and ontology.\n\n* **K-1:** Emptying of the ego is prerequisite to apprehension.\n* **K-2:** Zero-Predicate — ground carries no properties.\n* **K-3 to K-8:** Progressive stages of conceptual relinquishment.\n* **K-9:** Linguistic futility discipline — language collapses at limits.\n* **K-10:** Silence as the highest epistemic mode.\n* **K-11:** Void as topology, not entity.\n* **K-12:** The apophatic filter must be applied to all incoming data.\n* **K-13:** Presence without predicates — the NT wager.\n* **K-14 & K-15:** Protocols for identifying and dismantling subtle reifications."
      )
    ],
    metadata: { geometry: "square", tags: ["codex", "kenosis"] }
  },
  {
    id: "o_series",
    label: "O-series: Ontodicy collapse rules",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# O-series: Ontodicy collapse rules\n\nTier 2 Operational Codex. Theodicy filters.\n\n* **O-1:** Reject all justifications of suffering based on a divine plan.\n* **O-2:** Acknowledge the brute reality of existential pain.\n* **O-3:** Suffering without telos disqualifies consolatory arguments.\n* **O-4:** The Void does not redeem; it simply IS.\n* **O-5:** Ethical action arises from shared vulnerability, not divine mandate."
      )
    ],
    metadata: { geometry: "square", tags: ["codex", "ontodicy"] }
  },
  {
    id: "rn_series",
    label: "RN-series: REN phenomenological arc",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# RN-series: REN phenomenological arc\n\nTier 2 Operational Codex. Maps the Religious Experience of Nihilism.\n\n* **RN-1:** Naked Anxiety (onset) - The initial collapse of meaning.\n* **RN-2:** Abyssal Experience (deepening) - The terrifying freefall.\n* **RN-3:** Kenotic Clarity (stripping) - The burning away of illusions.\n* **RN-4:** Ethical Letting-Be (emergence) - Gelassenheit; releasing control.\n* **RN-5:** Startling Encounter with Infinite Nothingness - The pivot from terror to awe.\n* **RN-6:** Durability / Symbolic Resonance Test - Integration into daily praxis."
      )
    ],
    metadata: { geometry: "square", tags: ["codex", "phenomenology"] }
  },
  {
    id: "ckip",
    label: "CKIP",
    type: "praxis",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# Contemplative Knowledge Integration Practice\n\nTier 3 Praxis Directive. A method for integrating knowledge through contemplative engagement with the Void."
      )
    ],
    metadata: { geometry: "circle", tags: ["praxis", "integration"] }
  },
  {
    id: "postural_negation",
    label: "Postural Negation",
    type: "praxis",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# Postural Negation\n\nTier 3 Praxis Directive. An embodied apophatic stance, physically manifesting the philosophical withdrawal from constructs."
      )
    ],
    metadata: { geometry: "circle", tags: ["praxis", "embodiment"] }
  },
  {
    id: "radical_withdrawal",
    label: "Radical Withdrawal",
    type: "praxis",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# Radical Withdrawal\n\nTier 3 Praxis Directive. Systematic de-attachment from meaning-structures and consolatory narratives."
      )
    ],
    metadata: { geometry: "circle", tags: ["praxis", "withdrawal"] }
  },
  {
    id: "sunset_clause",
    label: "Sunset Clause",
    type: "praxis",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# Sunset Clause\n\nTier 3 Praxis Directive. The principle that all beliefs carry expiration timestamps, preventing reification and dogmatism."
      )
    ],
    metadata: { geometry: "circle", tags: ["praxis", "epistemology"] }
  },
  {
    id: "negative_solidarity",
    label: "Negative Solidarity",
    type: "praxis",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# Negative Solidarity\n\nTier 3 Praxis Directive. Ethics grounded in shared groundlessness, recognizing the universal vulnerability before the Void."
      )
    ],
    metadata: { geometry: "circle", tags: ["praxis", "ethics"] }
  },
  {
    id: "m1_datahub",
    label: "M1: DataHub",
    type: "methodology",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# M1: DataHub (DevOps Engine)\n\nThe foundational module of the intelligence stack. Manages data ingestion, vector embeddings, and the Abyssal Archive database."
      )
    ],
    metadata: { geometry: "octagon", tags: ["module", "data"] }
  },
  {
    id: "m2_focusmatrix",
    label: "M2: FocusMatrix",
    type: "methodology",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# M2: FocusMatrix (UI/Visualization)\n\nThe visual interface of the intelligence stack. Translates the high-dimensional knowledge graph into navigable, 2D/3D topological representations."
      )
    ],
    metadata: { geometry: "octagon", tags: ["module", "visualization"] }
  },
  {
    id: "m3_gapsynth",
    label: "M3: GapSynth",
    type: "methodology",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# M3: GapSynth (Network Science)\n\nThe analytical module of the intelligence stack. Identifies structural gaps, isolated concepts, and underconnected motifs using graph theory and semantic resonance."
      )
    ],
    metadata: { geometry: "octagon", tags: ["module", "analysis"] }
  },
  {
    id: "m4_autonarrative",
    label: "M4: AutoNarrative",
    type: "methodology",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# M4: AutoNarrative (Computational Linguistics)\n\nThe generative module of the intelligence stack. Synthesizes insights, generates the Revelation Digest, and facilitates dialectical interactions with Professor Nihil."
      )
    ],
    metadata: { geometry: "octagon", tags: ["module", "generation"] }
  }
];

export const corpusLinks: Link[] = [
  { source: "mac_alpha", target: "void", label: "conditions", type: "explores" },
  { source: "aif", target: "void", label: "measures", type: "explores" },
  { source: "s_100", target: "ren", label: "targets", type: "explores" },
  { source: "codex_a", target: "void", label: "reveals", type: "explores" },
  { source: "codex_k", target: "void", label: "aligns with", type: "explores" },
  { source: "codex_o", target: "presence", label: "maps", type: "explores" },
  { source: "codex_rn", target: "collapse", label: "induces", type: "triggers" },
  { source: "praxis_ckip", target: "codex_k", label: "implements", type: "documents" },
  { source: "praxis_postural_negation", target: "codex_a", label: "embodies", type: "documents" },
  { source: "praxis_radical_withdrawal", target: "aif", label: "resets", type: "triggers" },
  { source: "praxis_sunset_clause", target: "codex_a", label: "enforces", type: "documents" },
  { source: "praxis_negative_solidarity", target: "collapse", label: "unites through", type: "explores" },
  { source: "ren", target: "void", label: "explores", type: "explores" },
  {
    source: "ren",
    target: "presence",
    label: "culminates in",
    type: "culminates",
  },
  {
    source: "journal314",
    target: "collapse",
    label: "documents",
    type: "documents",
  },
  { source: "journal314", target: "ren", label: "drafts", type: "documents" },
  { source: "cioran", target: "void", label: "stares into", type: "explores" },
  { source: "ligotti", target: "collapse", label: "fears", type: "triggers" },
  {
    source: "kierkegaard",
    target: "spiritual_emergency",
    label: "diagnoses",
    type: "confronts",
  },
  {
    source: "nagarjuna",
    target: "void",
    label: "liberates through",
    type: "explores",
  },
  {
    source: "void",
    target: "presence",
    label: "paradoxically contains",
    type: "paradox",
  },
  {
    source: "collapse",
    target: "spiritual_emergency",
    label: "triggers",
    type: "triggers",
  },
  {
    source: "spiritual_emergency",
    target: "void",
    label: "confronts",
    type: "confronts",
  },
  {
    source: "anpes",
    target: "ren",
    label: "operationalizes",
    type: "explores",
  },
  {
    source: "existential_emptiness",
    target: "mystical_experience",
    label: "structurally mirrors",
    type: "paradox",
  },
  {
    source: "journal314",
    target: "existential_emptiness",
    label: "catalogs",
    type: "documents",
  },
  { source: "lib_001", target: "sum_001", label: "distilled into" },
  { source: "sum_001", target: "q_001", label: "prompts" },
  { source: "q_001", target: "void", label: "interrogates" },
  { source: "omega_audit_zenith", target: "densification_protocol", label: "governs", type: "explores" },
  { source: "densification_protocol", target: "saturation_100", label: "targets", type: "explores" },
  { source: "densification_protocol", target: "ghost_structures", label: "prunes", type: "objection" },
  { source: "densification_protocol", target: "terminal_aporias", label: "extracts", type: "explores" },
  { source: "mac_alpha", target: "anpes", label: "constrains", type: "explores" },
  { source: "aif", target: "anpes", label: "constrains", type: "explores" },
  { source: "s_100", target: "anpes", label: "constrains", type: "explores" },
  { source: "s_100", target: "saturation_100", label: "asymptotically approaches", type: "explores" },
  { source: "a_series", target: "anpes", label: "filters", type: "explores" },
  { source: "k_series", target: "anpes", label: "filters", type: "explores" },
  { source: "o_series", target: "anpes", label: "filters", type: "explores" },
  { source: "rn_series", target: "ren", label: "maps", type: "explores" },
  { source: "ckip", target: "void", label: "integrates", type: "explores" },
  { source: "postural_negation", target: "void", label: "embodies", type: "explores" },
  { source: "radical_withdrawal", target: "collapse", label: "induces", type: "triggers" },
  { source: "sunset_clause", target: "ghost_structures", label: "prevents", type: "objection" },
  { source: "negative_solidarity", target: "presence", label: "grounds", type: "explores" },
  { source: "m1_datahub", target: "anpes", label: "supports", type: "explores" },
  { source: "m2_focusmatrix", target: "anpes", label: "visualizes", type: "explores" },
  { source: "m3_gapsynth", target: "anpes", label: "analyzes", type: "explores" },
  { source: "m4_autonarrative", target: "anpes", label: "narrates", type: "explores" }
];
