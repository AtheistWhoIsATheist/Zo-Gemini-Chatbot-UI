import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Node, Link } from '../data/corpus';
import { Zap, ArrowRight, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { synthesizeNodes } from '../services/geminiService';
import { blocksToString } from '../utils/voidUtils';

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
  const [syntheses, setSyntheses] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
    return lLinks.slice(0, 15);
  }, [nodes, links]);

  const handleGenerateSynthesis = async (link: { source: Node; target: Node; reason: string }) => {
    const id = `${link.source.id}-${link.target.id}`;
    setLoadingId(id);
    try {
      const result = await synthesizeNodes(
        { title: link.source.label, content: blocksToString(link.source.blocks) },
        { title: link.target.label, content: blocksToString(link.target.blocks) }
      );
      setSyntheses(prev => ({ ...prev, [id]: result }));
    } catch (error) {
      console.error('Synthesis error:', error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0905] text-[#d4c8b0] font-sans border-l border-[#c8922a]/10">
      {/* Abyssal Header */}
      <div className="p-8 border-b border-[#c8922a]/10 bg-[#1a160d]/20 backdrop-blur-md">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-10 h-10 rounded-full border border-[#c8922a]/20 flex items-center justify-center bg-[#c8922a]/5">
            <BrainCircuit className="w-5 h-5 text-[#c8922a]" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-serif italic tracking-wide">Latent Echoes</h2>
            <p className="text-[9px] text-[#c8922a]/50 uppercase tracking-[0.2em] mt-0.5 font-mono">Sub-threshold Resonance</p>
          </div>
        </div>
        <p className="text-[11px] text-[#5a5a40] leading-relaxed font-serif italic">
          Conceptual bridges emerging from the void. Formalize the unspoken.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {latentLinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center opacity-30">
            <Zap className="w-8 h-8 text-[#c8922a] mb-4" />
            <p className="text-[#5a5a40] text-sm font-serif italic">
              The void is silent. No latent bridges detected.
            </p>
          </div>
        ) : (
          latentLinks.map((link, idx) => {
            const id = `${link.source.id}-${link.target.id}`;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "p-6 rounded-sm border transition-all duration-500 cursor-pointer group relative overflow-hidden",
                  activePrompt === id
                    ? "bg-[#1a160d]/60 border-[#c8922a]/30 shadow-[0_0_30px_rgba(200,146,42,0.05)]"
                    : "bg-[#1a160d]/20 border-[#c8922a]/5 hover:border-[#c8922a]/20 hover:bg-[#1a160d]/40"
                )}
                onClick={() => setActivePrompt(activePrompt === id ? null : id)}
              >
                <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[#c8922a]/20 to-transparent" />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[#c8922a]/60" />
                    <span className="text-[9px] uppercase tracking-[0.3em] text-[#c8922a]/40 font-mono">
                      Latent.Bridge_{idx}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div 
                    className="text-base font-serif italic text-[#d4c8b0]/90 hover:text-[#c8922a] transition-colors cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onNodeSelect(link.source); }}
                  >
                    {link.source.label}
                  </div>
                  
                  <div className="flex items-center gap-3 text-[#5a5a40] pl-4 border-l border-[#c8922a]/10 py-1">
                    <ArrowRight className="w-3 h-3 opacity-50" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-mono">
                      Via: {link.reason}
                    </span>
                  </div>

                  <div 
                    className="text-base font-serif italic text-[#d4c8b0]/90 hover:text-[#c8922a] transition-colors cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onNodeSelect(link.target); }}
                  >
                    {link.target.label}
                  </div>
                </div>

                <AnimatePresence>
                  {activePrompt === id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-6 border-t border-[#c8922a]/10">
                        {syntheses[id] ? (
                          <div className="text-xs text-[#d4c8b0]/70 leading-relaxed font-serif italic prose prose-invert prose-xs max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: syntheses[id].replace(/\n/g, '<br/>') }} />
                          </div>
                        ) : (
                          <>
                            <p className="text-[11px] text-[#5a5a40] leading-relaxed mb-4 font-serif italic">
                              <strong className="text-[#c8922a]/70 not-italic uppercase tracking-widest text-[9px] mr-2">The Inquiry:</strong> 
                              How does "{link.source.label}" recontextualize "{link.target.label}" through the lens of {link.reason}?
                            </p>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleGenerateSynthesis(link); }}
                              disabled={loadingId === id}
                              className="w-full py-3 bg-[#c8922a]/5 hover:bg-[#c8922a]/10 border border-[#c8922a]/20 text-[#c8922a] text-[10px] uppercase tracking-[0.2em] font-mono rounded-sm transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                            >
                              {loadingId === id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                              Forge Synthesis
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
