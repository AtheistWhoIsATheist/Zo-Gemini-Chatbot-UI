import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Node, Link } from '../data/corpus';
import { detectCommunities, Community } from '../utils/communityDetection';
import { Sparkles, Loader2, Layers, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface IntelligenceCardsProps {
  nodes: Node[];
  links: Link[];
  onNodeSelect: (node: Node) => void;
}

export function IntelligenceCards({ nodes, links, onNodeSelect }: IntelligenceCardsProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [synthesizingId, setSynthesizingId] = useState<number | null>(null);

  useEffect(() => {
    // Detect communities on mount or when nodes/links change
    const detected = detectCommunities(nodes, links);
    // Filter out very small communities (e.g., < 3 nodes) to reduce noise
    setCommunities(detected.filter(c => c.nodes.length >= 3));
  }, [nodes, links]);

  const handleSynthesize = async (community: Community) => {
    setSynthesizingId(community.id);
    try {
      const response = await fetch('/api/synthesize-community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: community.nodes })
      });
      
      if (!response.ok) throw new Error('Failed to synthesize');
      
      const data = await response.json();
      
      setCommunities(prev => prev.map(c => 
        c.id === community.id 
          ? { ...c, label: data.label, summary: data.summary }
          : c
      ));
    } catch (error) {
      console.error('Error synthesizing community:', error);
    } finally {
      setSynthesizingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full neo-bg font-sans relative overflow-hidden">
      <div className="px-8 py-6 border-b border-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="w-4 h-4 text-fuchsia-500/80" strokeWidth={3} />
          <div>
            <h2 className="text-[13px] font-semibold text-zinc-200 tracking-widest uppercase">Semantic Oracle</h2>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5 font-mono">AutoNarrative Active</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {communities.map((community) => (
          <motion.div 
            key={community.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="neo-flat rounded-2xl p-5 border border-white/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500/50" />
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-serif text-zinc-200">
                  {community.label || `Cluster ${community.id}`}
                </h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mt-1">
                  {community.nodes.length} Nodes
                </p>
              </div>
              
              {!community.summary && (
                <button
                  onClick={() => handleSynthesize(community)}
                  disabled={synthesizingId === community.id}
                  className="w-8 h-8 rounded-full neo-convex flex items-center justify-center text-fuchsia-500 hover:text-fuchsia-400 disabled:opacity-50 transition-colors"
                  title="Synthesize Narrative"
                >
                  {synthesizingId === community.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {community.summary ? (
              <div className="text-sm text-zinc-400 leading-relaxed mb-4">
                {community.summary}
              </div>
            ) : (
              <div className="text-xs text-zinc-600 italic mb-4">
                Awaiting synthesis...
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
              {community.nodes.slice(0, 5).map(node => (
                <button
                  key={node.id}
                  onClick={() => onNodeSelect(node)}
                  className="px-2 py-1 bg-black/40 border border-white/5 rounded text-[10px] text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-colors truncate max-w-[120px]"
                >
                  {node.label}
                </button>
              ))}
              {community.nodes.length > 5 && (
                <span className="px-2 py-1 text-[10px] text-zinc-600">
                  +{community.nodes.length - 5} more
                </span>
              )}
            </div>
          </motion.div>
        ))}

        {communities.length === 0 && (
          <div className="text-center text-zinc-500 text-sm mt-10">
            No significant communities detected.
          </div>
        )}
      </div>
    </div>
  );
}
