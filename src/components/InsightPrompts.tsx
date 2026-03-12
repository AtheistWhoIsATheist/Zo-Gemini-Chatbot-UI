import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Node, Link } from '../data/corpus';
import { Zap, ArrowRight, Sparkles, BrainCircuit } from 'lucide-react';
import { cn } from '../lib/utils';

export function InsightPrompts({ 
  nodes, 
  links,
  onNodeSelect 
}: { 
  nodes: Node[]; 
  links: Link[];
  onNodeSelect: (node: Node) => void;
}) {
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  const latentLinks = useMemo(() => {
    const lLinks: { source: Node; target: Node; reason: string }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const isLinked = links.some(l => 
          (typeof l.source === 'string' ? l.source === n1.id : (l.source as any).id === n1.id) && 
          (typeof l.target === 'string' ? l.target === n2.id : (l.target as any).id === n2.id) ||
          (typeof l.source === 'string' ? l.source === n2.id : (l.source as any).id === n2.id) && 
          (typeof l.target === 'string' ? l.target === n1.id : (l.target as any).id === n1.id)
        );
        if (!isLinked) {
          const tags1 = n1.metadata?.tags || [];
          const tags2 = n2.metadata?.tags || [];
          const sharedTags = tags1.filter(t => tags2.includes(t));
          if (sharedTags.length >= 2) {
            lLinks.push({ source: n1, target: n2, reason: sharedTags.join(', ') });
          }
        }
      }
    }
    return lLinks.slice(0, 15); // Limit to top 15 for performance/UI
  }, [nodes, links]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-zinc-100 font-sans border-l border-white/5">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-2">
          <BrainCircuit className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-medium tracking-wide">Insight Prompts</h2>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Latent Synapses detected. These are conceptual bridges waiting to be formalized.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {latentLinks.length === 0 ? (
          <div className="text-center p-8 text-zinc-500 text-sm">
            No latent synapses detected. Expand your ontology to discover new connections.
          </div>
        ) : (
          latentLinks.map((link, idx) => (
            <motion.div
              key={`${link.source.id}-${link.target.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "p-4 rounded-xl border transition-all duration-300 cursor-pointer group",
                activePrompt === `${link.source.id}-${link.target.id}`
                  ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  : "bg-zinc-900/50 border-white/5 hover:border-white/20 hover:bg-zinc-900/80"
              )}
              onClick={() => setActivePrompt(
                activePrompt === `${link.source.id}-${link.target.id}` ? null : `${link.source.id}-${link.target.id}`
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] uppercase tracking-widest text-emerald-500/70 font-bold">
                    Latent Bridge
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div 
                  className="text-sm font-medium text-zinc-300 hover:text-emerald-400 transition-colors"
                  onClick={(e) => { e.stopPropagation(); onNodeSelect(link.source); }}
                >
                  {link.source.label}
                </div>
                
                <div className="flex items-center gap-2 text-zinc-600 pl-2 border-l border-white/10 py-1">
                  <ArrowRight className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">
                    Via: {link.reason}
                  </span>
                </div>

                <div 
                  className="text-sm font-medium text-zinc-300 hover:text-emerald-400 transition-colors"
                  onClick={(e) => { e.stopPropagation(); onNodeSelect(link.target); }}
                >
                  {link.target.label}
                </div>
              </div>

              <AnimatePresence>
                {activePrompt === `${link.source.id}-${link.target.id}` && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                        <strong className="text-zinc-300">Synthesis Prompt:</strong> How does the concept of "{link.source.label}" recontextualize or challenge "{link.target.label}" when viewed through the lens of {link.reason}?
                      </p>
                      <button className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Generate Synthesis
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
