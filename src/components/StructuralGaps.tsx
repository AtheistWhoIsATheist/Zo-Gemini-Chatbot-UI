import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Node, corpusLinks } from '../data/corpus';
import { Network, AlertTriangle, Link as LinkIcon, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export function StructuralGaps({ nodes, onNodeSelect }: { nodes: Node[]; onNodeSelect: (node: Node) => void }) {
  const [activeTab, setActiveTab] = useState<'isolated' | 'underconnected' | 'suggestions'>('isolated');

  const analysis = useMemo(() => {
    const degrees = new Map<string, number>();
    nodes.forEach(n => degrees.set(n.id, 0));
    
    corpusLinks.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      degrees.set(sourceId, (degrees.get(sourceId) || 0) + 1);
      degrees.set(targetId, (degrees.get(targetId) || 0) + 1);
    });

    const isolated = nodes.filter(n => (degrees.get(n.id) || 0) === 0);
    const underconnected = nodes.filter(n => {
      const deg = degrees.get(n.id) || 0;
      return deg > 0 && deg <= 2;
    });

    // Generate suggestions based on shared tags but no links
    const suggestions: { source: Node; target: Node; reason: string }[] = [];
    
    // To avoid O(N^2) being too slow, we can limit the checks or just do it since N is small
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        
        // Check if they are already linked
        const isLinked = corpusLinks.some(l => {
          const sId = typeof l.source === 'string' ? l.source : l.source.id;
          const tId = typeof l.target === 'string' ? l.target : l.target.id;
          return (sId === n1.id && tId === n2.id) || (sId === n2.id && tId === n1.id);
        });

        if (!isLinked) {
          const tags1 = n1.metadata?.tags || [];
          const tags2 = n2.metadata?.tags || [];
          const sharedTags = tags1.filter(t => tags2.includes(t));
          
          if (sharedTags.length >= 2) {
            suggestions.push({
              source: n1,
              target: n2,
              reason: `Share multiple tags: ${sharedTags.join(', ')}`
            });
          } else if (sharedTags.length === 1 && (n1.type === 'concept' || n2.type === 'concept')) {
             suggestions.push({
              source: n1,
              target: n2,
              reason: `Share tag: ${sharedTags[0]}`
            });
          }
        }
      }
    }

    // Sort suggestions by some metric or just take top 20
    const topSuggestions = suggestions.slice(0, 20);

    return { isolated, underconnected, suggestions: topSuggestions, degrees };
  }, [nodes]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] text-zinc-100 p-8 overflow-hidden">
      <div className="flex items-center gap-3 mb-8">
        <Network className="w-6 h-6 text-orange-500" />
        <h1 className="text-2xl font-light tracking-tight">Structural Gap Analysis</h1>
      </div>

      <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('isolated')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === 'isolated' 
              ? "bg-red-500/20 text-red-400 border border-red-500/30" 
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          Isolated Concepts ({analysis.isolated.length})
        </button>
        <button
          onClick={() => setActiveTab('underconnected')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === 'underconnected' 
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" 
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          )}
        >
          <LinkIcon className="w-4 h-4" />
          Underconnected ({analysis.underconnected.length})
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === 'suggestions' 
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          )}
        >
          <Sparkles className="w-4 h-4" />
          Link Suggestions ({analysis.suggestions.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        {activeTab === 'isolated' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.isolated.map(node => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-zinc-900/50 border border-red-500/20 rounded-xl hover:border-red-500/50 transition-colors cursor-pointer group"
                onClick={() => onNodeSelect(node)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-red-400 font-bold">{node.type}</span>
                  <span className="text-xs text-zinc-500">0 Links</span>
                </div>
                <h3 className="text-lg font-medium text-zinc-200 group-hover:text-white transition-colors">{node.label}</h3>
                <p className="text-sm text-zinc-500 mt-2 line-clamp-2">
                  This node exists in the void, completely disconnected from the rest of the corpus.
                </p>
              </motion.div>
            ))}
            {analysis.isolated.length === 0 && (
              <div className="col-span-full text-center py-12 text-zinc-500">
                No isolated concepts found. The graph is fully connected.
              </div>
            )}
          </div>
        )}

        {activeTab === 'underconnected' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.underconnected.map(node => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-zinc-900/50 border border-orange-500/20 rounded-xl hover:border-orange-500/50 transition-colors cursor-pointer group"
                onClick={() => onNodeSelect(node)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-orange-400 font-bold">{node.type}</span>
                  <span className="text-xs text-zinc-500">{analysis.degrees.get(node.id)} Links</span>
                </div>
                <h3 className="text-lg font-medium text-zinc-200 group-hover:text-white transition-colors">{node.label}</h3>
                <p className="text-sm text-zinc-500 mt-2 line-clamp-2">
                  Consider expanding on this concept to integrate it deeper into the knowledge graph.
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="flex flex-col gap-4">
            {analysis.suggestions.map((sug, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 bg-zinc-900/50 border border-emerald-500/20 rounded-xl flex items-center justify-between hover:border-emerald-500/50 transition-colors"
              >
                <div 
                  className="flex-1 cursor-pointer group"
                  onClick={() => onNodeSelect(sug.source)}
                >
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{sug.source.type}</div>
                  <div className="text-base font-medium text-zinc-300 group-hover:text-emerald-400 transition-colors">{sug.source.label}</div>
                </div>
                
                <div className="flex flex-col items-center px-8 text-zinc-500">
                  <ArrowRight className="w-5 h-5 mb-1 text-emerald-500/50" />
                  <span className="text-[10px] uppercase tracking-wider text-emerald-500/70 text-center max-w-[150px]">{sug.reason}</span>
                </div>

                <div 
                  className="flex-1 text-right cursor-pointer group"
                  onClick={() => onNodeSelect(sug.target)}
                >
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{sug.target.type}</div>
                  <div className="text-base font-medium text-zinc-300 group-hover:text-emerald-400 transition-colors">{sug.target.label}</div>
                </div>
              </motion.div>
            ))}
            {analysis.suggestions.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                No obvious link suggestions found based on current metadata.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
