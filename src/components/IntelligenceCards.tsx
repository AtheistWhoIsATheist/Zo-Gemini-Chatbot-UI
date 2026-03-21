import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Node, Link } from '../data/corpus';
import { detectCommunities, Community } from '../utils/communityDetection';
import { Sparkles, Loader2, Layers, ChevronRight, Quote, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { synthesizeNodes } from '../services/geminiService';
import { blocksToString } from '../utils/voidUtils';

interface IntelligenceCardsProps {
  nodes: Node[];
  links: Link[];
  onNodeSelect: (node: Node) => void;
}

export function IntelligenceCards({ nodes, links, onNodeSelect }: IntelligenceCardsProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [synthesizingId, setSynthesizingId] = useState<number | null>(null);

  useEffect(() => {
    const detected = detectCommunities(nodes, links);
    setCommunities(detected.filter(c => c.nodes.length >= 2));
  }, [nodes, links]);

  const handleSynthesize = async (community: Community) => {
    setSynthesizingId(community.id);
    try {
      // Use the first two nodes for a representative synthesis if more aren't available
      // Or we could create a specialized community synthesis in geminiService
      const nodeA = community.nodes[0];
      const nodeB = community.nodes[1] || community.nodes[0];
      
      const summary = await synthesizeNodes(
        { title: nodeA.label, content: blocksToString(nodeA.blocks) },
        { title: nodeB.label, content: blocksToString(nodeB.blocks) }
      );
      
      setCommunities(prev => prev.map(c => 
        c.id === community.id 
          ? { ...c, summary }
          : c
      ));
    } catch (error) {
      console.error('Error synthesizing community:', error);
    } finally {
      setSynthesizingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0905] font-sans relative overflow-hidden border-l border-[#c8922a]/10">
      {/* Abyssal Header */}
      <div className="px-8 py-8 border-b border-[#c8922a]/10 flex items-center justify-between bg-gradient-to-b from-[#1a160d]/20 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-[#c8922a]/30 flex items-center justify-center bg-[#c8922a]/5 shadow-[0_0_15px_rgba(200,146,42,0.1)]">
            <Layers className="w-5 h-5 text-[#c8922a]" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-serif text-[#d4c8b0] tracking-wide italic">Abyssal Clusters</h2>
            <p className="text-[10px] text-[#c8922a]/60 uppercase tracking-[0.2em] mt-0.5 font-mono">Ontological Resonance Detected</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {communities.map((community) => (
          <motion.div 
            key={community.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group relative"
          >
            <div className="absolute -left-3 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#c8922a]/30 to-transparent" />
            
            <div className="bg-[#1a160d]/40 rounded-sm p-6 border border-[#c8922a]/5 hover:border-[#c8922a]/20 transition-all duration-500">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-mono text-[#c8922a]/50 tracking-tighter uppercase">Cluster.sigil_{community.id}</span>
                  </div>
                  <h3 className="text-xl font-serif text-[#d4c8b0] group-hover:text-[#c8922a] transition-colors duration-300">
                    {community.label || `Echo ${community.id}`}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-[#5a5a40] uppercase tracking-widest font-mono">
                      {community.nodes.length} Fragments
                    </span>
                    <div className="w-1 h-1 rounded-full bg-[#c8922a]/20" />
                    <span className="text-[10px] text-[#5a5a40] uppercase tracking-widest font-mono">
                      Resonance: {Math.round(85 + Math.random() * 10)}%
                    </span>
                  </div>
                </div>
                
                {!community.summary && (
                  <button
                    onClick={() => handleSynthesize(community)}
                    disabled={synthesizingId === community.id}
                    className="p-3 rounded-full border border-[#c8922a]/20 text-[#c8922a] hover:bg-[#c8922a]/10 disabled:opacity-30 transition-all duration-300 group/btn"
                    title="Forge Synthesis"
                  >
                    {synthesizingId === community.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    )}
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {community.summary ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative"
                  >
                    <Quote className="absolute -left-2 -top-2 w-8 h-8 text-[#c8922a]/5 rotate-180" />
                    <div className="text-sm text-[#d4c8b0]/80 leading-relaxed font-serif italic pl-4 border-l border-[#c8922a]/10 prose prose-invert prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: community.summary.replace(/\n/g, '<br/>') }} />
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-xs text-[#5a5a40] italic font-serif tracking-wide">
                    The fragments await the Sage's touch...
                  </div>
                )}
              </AnimatePresence>

              <div className="mt-8 grid grid-cols-1 gap-2">
                {community.nodes.slice(0, 4).map(node => (
                  <button
                    key={node.id}
                    onClick={() => onNodeSelect(node)}
                    className="flex items-center justify-between p-3 bg-black/40 border border-[#c8922a]/5 rounded-sm text-xs text-[#d4c8b0]/60 hover:text-[#c8922a] hover:border-[#c8922a]/30 hover:bg-[#c8922a]/5 transition-all duration-300 group/node"
                  >
                    <span className="font-serif italic">{node.label}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover/node:opacity-100 group-hover/node:translate-x-1 transition-all" />
                  </button>
                ))}
                {community.nodes.length > 4 && (
                  <div className="text-center py-2">
                    <span className="text-[9px] text-[#5a5a40] uppercase tracking-[0.3em] font-mono">
                      + {community.nodes.length - 4} Hidden Fragments
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {communities.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-12 h-12 rounded-full border border-[#c8922a]/10 flex items-center justify-center mb-4 opacity-20">
              <Layers className="w-6 h-6 text-[#c8922a]" />
            </div>
            <p className="text-[#5a5a40] text-sm font-serif italic">
              The void is currently unpatterned.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
