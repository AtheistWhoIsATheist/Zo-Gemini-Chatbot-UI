
import { useEffect, useState } from 'react';
import { Node } from '../data/corpus';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface RelatedVoidsProps {
  nodeId: string | undefined;
  onSelect: (node: Node) => void;
}

export function RelatedVoids({ nodeId, onSelect }: RelatedVoidsProps) {
  const [related, setRelated] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!nodeId) return;

    const fetchRelated = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/vector/related/${nodeId}`);
        if (res.ok) {
          const data = await res.json();
          setRelated(data);
        }
      } catch (e) {
        console.error("Failed to fetch related voids", e);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [nodeId]);

  if (!nodeId) {
    return (
      <div className="p-8 text-center text-zinc-600 text-xs font-mono uppercase tracking-widest">
        Select a node to reveal connections...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-6 text-orange-500">
        <Sparkles className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-widest">Related Voids</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
        {loading ? (
          <div className="text-zinc-600 text-xs animate-pulse">Scanning the vector space...</div>
        ) : related.length === 0 ? (
          <div className="text-zinc-600 text-xs">No semantic echoes found.</div>
        ) : (
          related.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelect(node)}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-orange-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500">{node.type}</span>
                <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-orange-500 transition-colors" />
              </div>
              <h4 className="text-sm font-serif text-zinc-300 group-hover:text-zinc-100 transition-colors">
                {node.label}
              </h4>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
