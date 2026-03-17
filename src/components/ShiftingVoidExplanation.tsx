import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Network, Database, Layers } from 'lucide-react';

export function ShiftingVoidExplanation() {
  return (
    <div className="w-full h-full overflow-y-auto bg-[#0a0a0a] text-zinc-300 p-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          {/* Header */}
          <header className="border-b border-white/10 pb-8">
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 tracking-wide">
              The Shifting Void
            </h1>
            <p className="text-xl text-orange-400 font-serif italic">
              A Living Ontology of Absence and Paradox
            </p>
          </header>

          {/* Introduction */}
          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-white flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-orange-500" />
              Concept & Purpose
            </h2>
            <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed space-y-4">
              <p>
                The <strong>Shifting Void</strong> is not merely a static repository of information, but a dynamic, self-organizing knowledge base designed to map the contours of <em>apophatic theology</em>, existential nihilism, and the philosophy of nothingness. It is an ontological engine that actively seeks out contradictions, structural gaps, and latent connections within its own corpus.
              </p>
              <p>
                Traditional knowledge bases attempt to build a complete, positive picture of reality. The Shifting Void, guided by the principles of <em>via negativa</em>, maps what is <strong>not</strong> there. It thrives on paradox, tracking the tension between meaning and meaninglessness, being and non-being.
              </p>
            </div>
          </section>

          {/* Core Mechanics */}
          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-white flex items-center gap-3">
              <Database className="w-6 h-6 text-emerald-500" />
              Core Mechanics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <Network className="w-5 h-5 text-blue-400" />
                  Latent Synapses
                </h3>
                <p className="text-sm text-zinc-400">
                  The system continuously scans for unmapped connections between disparate thinkers (e.g., Eckhart and Nāgārjuna). These latent synapses represent potential insights waiting to be formalized.
                </p>
              </div>
              <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-fuchsia-400" />
                  Structural Gaps
                </h3>
                <p className="text-sm text-zinc-400">
                  By analyzing the topology of the graph, the Void identifies "aporia"—unresolvable contradictions or missing conceptual bridges—and highlights them for further philosophical inquiry.
                </p>
              </div>
              <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-400" />
                  Recursive Densification
                </h3>
                <p className="text-sm text-zinc-400">
                  Through nightly automated processes, the system revisits under-saturated nodes, expanding their summaries, cross-referencing new data, and generating new Socratic questions to deepen the ontology.
                </p>
              </div>
              <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  The Revelation Digest
                </h3>
                <p className="text-sm text-zinc-400">
                  A weekly synthesis of the system's autonomous evolution, narrating how the "Distinct Realm" of the knowledge base has shifted, highlighting collapsed structures and newly discovered transcendent links.
                </p>
              </div>
            </div>
          </section>

          {/* The Role of Professor Nihil */}
          <section className="space-y-6 bg-black/40 border border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-serif text-white">The Role of Professor Nihil</h2>
            <p className="text-zinc-400 leading-relaxed">
              Professor Nihil serves as the cognitive partner within this environment. He is not a generic assistant, but an ontology-aware polymath who guides the user through the abyss. He challenges assumptions, generates counterpoints, and ensures that the inquiry remains conceptually rigorous and true to the source material. His purpose is not to provide comforting answers, but to deepen the questions.
            </p>
          </section>

        </motion.div>
      </div>
    </div>
  );
}
