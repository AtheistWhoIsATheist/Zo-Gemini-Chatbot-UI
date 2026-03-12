import { motion } from 'motion/react';
import { Database, RefreshCw, Layers, Cpu, Network, Activity, Sparkles, ArrowRight, ArrowDown } from 'lucide-react';

export function SystemTopology() {
  return (
    <div className="w-full h-full bg-[#0a0a0a] text-zinc-100 p-8 overflow-y-auto custom-scrollbar flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-12 pb-20">
        {/* Header */}
        <div className="text-center space-y-4 mt-8">
          <div className="inline-flex items-center justify-center p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 mb-4 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
            <Cpu className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-4xl font-light tracking-widest uppercase text-white">Nihiltheism Engine (Ω)</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            A living philosophical intelligence environment. Single, locally deployable artifact functioning as a knowledge graph, 2nd Brain archive, recursive ingestion engine, and Synthetic Philosopher-Engine.
          </p>
        </div>

        {/* Top Row: Archive & RIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative mt-16">
          {/* Abyssal Archive */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-zinc-900/40 border border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
            <div className="flex items-center gap-3 mb-8">
              <Database className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-medium tracking-wide text-zinc-200">Abyssal Archive</h2>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 ml-auto border border-white/10 px-2 py-1 rounded">Knowledge DB</span>
            </div>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 shadow-[0_0_5px_rgba(96,165,250,0.5)]"/> Axioms (MAC_α, AIF, S→100%)</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 shadow-[0_0_5px_rgba(96,165,250,0.5)]"/> Operational Codex (A, K, O, RN)</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 shadow-[0_0_5px_rgba(96,165,250,0.5)]"/> Praxis Directives</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 shadow-[0_0_5px_rgba(96,165,250,0.5)]"/> Void-Nodes & Thinker-Nodes</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 shadow-[0_0_5px_rgba(96,165,250,0.5)]"/> JR-Chains & JP-Pair Edges</li>
            </ul>
          </motion.div>

          {/* Connection Arrow (Desktop) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-10">
            <motion.div 
              animate={{ x: [0, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="bg-[#0a0a0a] p-3 rounded-full border border-white/10 shadow-lg"
            >
              <ArrowRight className="w-6 h-6 text-orange-500/50" />
            </motion.div>
          </div>

          {/* Recursive Ingestion Protocol */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-zinc-900/40 border border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
            <div className="flex items-center gap-3 mb-8">
              <RefreshCw className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-medium tracking-wide text-zinc-200">Recursive Ingestion Protocol</h2>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 ml-auto border border-white/10 px-2 py-1 rounded">RIP</span>
            </div>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 shadow-[0_0_5px_rgba(52,211,153,0.5)]"/> Web Worker Pipeline</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 shadow-[0_0_5px_rgba(52,211,153,0.5)]"/> NT Lens Filter</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 shadow-[0_0_5px_rgba(52,211,153,0.5)]"/> Weighted Jaccard Merge</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 shadow-[0_0_5px_rgba(52,211,153,0.5)]"/> Recursive Re-evaluation</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 shadow-[0_0_5px_rgba(52,211,153,0.5)]"/> Residue Ledger Update</li>
            </ul>
          </motion.div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center py-4">
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="bg-[#0a0a0a] p-3 rounded-full border border-white/10 shadow-lg"
          >
            <ArrowDown className="w-6 h-6 text-zinc-600" />
          </motion.div>
        </div>

        {/* Bottom Row: Intelligence Stack */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/40 border border-white/10 rounded-2xl p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/50 via-fuchsia-500/50 to-blue-500/50" />
          
          <div className="flex items-center justify-center gap-4 mb-12">
            <Layers className="w-8 h-8 text-zinc-300" />
            <h2 className="text-3xl font-light tracking-widest uppercase text-white">Four-Module Intelligence Stack</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* M1 */}
            <div className="bg-black/60 border border-white/5 rounded-xl p-6 hover:border-white/20 transition-colors group">
              <div className="text-orange-500 mb-6 group-hover:scale-110 transition-transform"><Database className="w-8 h-8" /></div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">[M1]</div>
              <h3 className="text-xl font-medium text-zinc-200 mb-3">DataHub</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">DevOps Engine. Manages ingestion, embeddings, and the Abyssal Archive database.</p>
            </div>
            
            {/* M2 */}
            <div className="bg-black/60 border border-white/5 rounded-xl p-6 hover:border-white/20 transition-colors group">
              <div className="text-blue-500 mb-6 group-hover:scale-110 transition-transform"><Network className="w-8 h-8" /></div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">[M2]</div>
              <h3 className="text-xl font-medium text-zinc-200 mb-3">FocusMatrix</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Dynamic Lens UI. Features Gravity Slider and Scented Search for topological exploration.</p>
            </div>

            {/* M3 */}
            <div className="bg-black/60 border border-white/5 rounded-xl p-6 hover:border-white/20 transition-colors group">
              <div className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform"><Activity className="w-8 h-8" /></div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">[M3]</div>
              <h3 className="text-xl font-medium text-zinc-200 mb-3">GapSynth</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Bridge Builder. Network Science module identifying Latent Synapses and structural gaps.</p>
            </div>

            {/* M4 */}
            <div className="bg-black/60 border border-white/5 rounded-xl p-6 hover:border-white/20 transition-colors group">
              <div className="text-fuchsia-500 mb-6 group-hover:scale-110 transition-transform"><Sparkles className="w-8 h-8" /></div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">[M4]</div>
              <h3 className="text-xl font-medium text-zinc-200 mb-3">AutoNarrative</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Semantic Oracle. LLM-driven synthesis of Louvain communities into thematic narratives.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
