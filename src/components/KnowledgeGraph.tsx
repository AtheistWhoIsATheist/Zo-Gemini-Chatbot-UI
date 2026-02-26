import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { corpusNodes, corpusLinks, Node } from '../data/corpus';
import { cn } from '../lib/utils';

interface KnowledgeGraphProps {
  onNodeSelect: (node: Node) => void;
  selectedNodeId?: string;
}

export function KnowledgeGraph({ onNodeSelect, selectedNodeId }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Simple circular layout calculation
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const radius = Math.min(centerX, centerY) * 0.7;

  const nodePositions = corpusNodes.map((node, index) => {
    const angle = (index / corpusNodes.length) * 2 * Math.PI;
    return {
      ...node,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'treatise': return 'bg-zinc-100 text-black';
      case 'journal': return 'bg-zinc-800 text-zinc-300 border border-zinc-600';
      case 'thinker': return 'bg-transparent text-zinc-400 border border-zinc-700 border-dashed';
      case 'concept': return 'bg-orange-900/20 text-orange-500 border border-orange-900/50';
      default: return 'bg-zinc-800 text-zinc-300';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#050505]">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {corpusLinks.map((link, i) => {
          const sourceNode = nodePositions.find(n => n.id === link.source);
          const targetNode = nodePositions.find(n => n.id === link.target);
          if (!sourceNode || !targetNode) return null;
          
          const isHighlighted = selectedNodeId === link.source || selectedNodeId === link.target;
          
          return (
            <g key={i}>
              <line
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={isHighlighted ? '#52525b' : '#27272a'}
                strokeWidth={isHighlighted ? 2 : 1}
                className="transition-all duration-500"
              />
              {isHighlighted && link.label && (
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2}
                  fill="#71717a"
                  fontSize="10"
                  textAnchor="middle"
                  className="font-mono"
                >
                  {link.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {nodePositions.map((node) => {
        const isSelected = selectedNodeId === node.id;
        return (
          <motion.button
            key={node.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: isSelected ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
            onClick={() => onNodeSelect(node)}
            className={cn(
              "absolute transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-full text-xs font-mono whitespace-nowrap transition-colors duration-300 shadow-lg cursor-pointer",
              getNodeColor(node.type),
              isSelected && "ring-2 ring-white ring-offset-2 ring-offset-[#050505] z-10"
            )}
            style={{ left: node.x, top: node.y }}
          >
            {node.label}
          </motion.button>
        );
      })}
    </div>
  );
}
