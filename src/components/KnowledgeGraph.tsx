/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { corpusNodes, corpusLinks, Node } from '../data/corpus';
import { cn } from '../lib/utils';
import { Hand, Maximize, RotateCcw, ZoomIn, ShieldAlert, CheckCircle2, HelpCircle, Activity, Sparkles, Network, BrainCircuit } from 'lucide-react';
import { useGraphLayout } from '../hooks/useGraphLayout';

interface KnowledgeGraphProps {
  onNodeSelect: (node: Node) => void;
  selectedNodeId?: string;
}

export function KnowledgeGraph({ onNodeSelect, selectedNodeId }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [depth, setDepth] = useState(1.2);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [groupBy, setGroupBy] = useState<'type' | 'status' | 'none'>('none');
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);

  // STEP 1 & 3: Semantic Extraction & Categorical Tagging (Filtering)
  const filteredNodes = useMemo(() => {
    if (activeFilters.size === 0) return corpusNodes;
    return corpusNodes.filter(node => activeFilters.has(node.type));
  }, [activeFilters]);

  // STEP 4 & 5: Topology & Visual Rendering
  const { nodePositions } = useGraphLayout({ nodes: filteredNodes, links: corpusLinks, depth, groupBy });

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) setIsPanning(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const zoomSpeed = 0.001;
      setScale(Math.max(0.5, Math.min(3, scale - e.deltaY * zoomSpeed)));
    } else {
      const depthSpeed = 0.001;
      setDepth(prev => Math.max(0.5, Math.min(2.5, prev - e.deltaY * depthSpeed)));
    }
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setDepth(1.2);
  };

  // STEP 6: Dynamic Insight Generation Engine
  const getInsights = (nodeId: string) => {
    const node = corpusNodes.find(n => n.id === nodeId);
    if (!node) return null;

    const connectedLinks = corpusLinks.filter(l => l.source === nodeId || l.target === nodeId);
    const connectedNodeIds = new Set(connectedLinks.map(l => l.source === nodeId ? l.target : l.source));

    // STEP 2: Dimensional Embedding (Vectorization) - Mocked via tag/type overlap
    const similarities = corpusNodes
      .filter(n => n.id !== nodeId && !connectedNodeIds.has(n.id))
      .map(n => {
        let score = 0;
        if (n.type === node.type) score += 0.3;
        const sharedTags = (n.metadata?.tags || []).filter(t => (node.metadata?.tags || []).includes(t));
        score += sharedTags.length * 0.25;
        return { ...n, similarity: Math.min(score, 0.99) };
      })
      .filter(n => n.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    let suggestion = "";
    if (similarities.length > 0) {
      suggestion = `Explore the latent vector relationship between "${node.label}" and "${similarities[0].label}". They share dimensional attributes but lack a direct topological edge.`;
    } else if (connectedNodeIds.size === 0) {
      suggestion = `This node exists in a void state. Synthesize connections to core treatises to anchor it in the network.`;
    } else {
      suggestion = `High centrality detected. Consider collapsing sub-nodes into a new overarching methodology.`;
    }

    return { degree: connectedLinks.length, similarities, suggestion };
  };

  const selectedInsights = selectedNodeId ? getInsights(selectedNodeId) : null;
  const highlightedNodes = ['spiritual_emergency', 'void', 'collapse', 'anpes', 'ethics'];
  
  const getNodeStyle = (node: Node, isSelected: boolean, isHovered: boolean) => {
    const base = "transition-all duration-300 cursor-pointer tracking-widest uppercase z-20 font-mono text-[10px] whitespace-nowrap px-6 py-2.5";
    
    let shape = "rounded-full";
    const geometry = node.metadata?.geometry || (
      node.type === 'library_item' ? 'square' :
      node.type === 'summary' ? 'hex' :
      node.type === 'question' ? 'diamond' : 'circle'
    );

    if (geometry === 'square') shape = "rounded-lg";
    if (geometry === 'diamond') shape = "rounded-none rotate-45";
    if (geometry === 'hex') shape = "rounded-xl";
    if (geometry === 'octagon') shape = "rounded-2xl";

    let color = "neo-convex text-zinc-500";
    if (isSelected || isHovered) {
      color = "neo-pressed text-orange-400 ring-1 ring-orange-500/30 neo-frosted";
    } else if (highlightedNodes.includes(node.id) || node.metadata?.chromatic_tag) {
      color = "neo-convex text-orange-500/80 neo-frosted";
    } else {
      color = "neo-dim";
    }

    return cn(base, shape, color);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'VERIFIED': return <CheckCircle2 className="w-3 h-3 text-emerald-500/70" />;
      case 'INFERENCE': return <HelpCircle className="w-3 h-3 text-amber-500/70" />;
      case 'HYPOTHESIS': return <ShieldAlert className="w-3 h-3 text-orange-500/70" />;
      default: return null;
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "relative w-full h-full overflow-hidden neo-bg transition-all duration-300",
        isPanning ? "cursor-grabbing" : "cursor-default"
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Parallax Background */}
      <motion.div 
        animate={{ 
          x: offset.x * 0.1 * depth,
          y: offset.y * 0.1 * depth,
          scale: 1 + (depth - 1.2) * 0.2
        }}
        className="absolute inset-[-50%] parallax-bg pointer-events-none opacity-40 z-0"
      />

      {/* Graph Controls Micro-toolbar (Left) */}
      <div className="absolute top-6 left-6 z-50 flex flex-col items-start gap-2">
        <div className="neo-flat-sm flex items-center gap-4 px-3 py-2 rounded-lg">
          <span className="text-[9px] uppercase tracking-widest text-zinc-500">Group By:</span>
          <select 
            className="bg-transparent text-[9px] uppercase tracking-widest text-zinc-300 outline-none cursor-pointer"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
          >
            <option value="none" className="bg-zinc-900">None</option>
            <option value="type" className="bg-zinc-900">Type</option>
            <option value="status" className="bg-zinc-900">Status</option>
          </select>
        </div>
        <div className="neo-flat-sm flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg max-w-[300px]">
          <span className="text-[9px] uppercase tracking-widest text-zinc-500 w-full mb-1">Filter by Type:</span>
          {Array.from(new Set(corpusNodes.map(n => n.type))).map(type => (
            <button
              key={type}
              onClick={() => {
                const newFilters = new Set(activeFilters);
                if (newFilters.has(type)) newFilters.delete(type);
                else newFilters.add(type);
                setActiveFilters(newFilters);
              }}
              className={cn(
                "text-[8px] uppercase tracking-widest px-2 py-1 rounded-full transition-colors",
                activeFilters.has(type) ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-white/5 text-zinc-500 hover:text-zinc-300 border border-transparent"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Graph Controls Micro-toolbar (Right) */}
      <div className="absolute top-6 right-6 z-50 flex flex-col items-end gap-2">
        <div className="neo-flat-sm flex items-center gap-4 px-3 py-2 rounded-lg">
          <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsPanning(!isPanning)}>
            <Hand className={cn("w-3 h-3 transition-colors", isPanning ? "text-orange-400" : "text-zinc-500 group-hover:text-zinc-300")} />
            <span className="text-[9px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">Pan</span>
          </div>
          <div className="flex items-center gap-1.5 group cursor-pointer">
            <ZoomIn className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
            <span className="text-[9px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">Zoom: Ctrl+Scroll</span>
          </div>
          <div className="flex items-center gap-1.5 group cursor-pointer" onClick={resetView}>
            <RotateCcw className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
            <span className="text-[9px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">Reset</span>
          </div>
          <div className="flex items-center gap-1.5 group cursor-pointer">
            <Maximize className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
            <span className="text-[9px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">Fit</span>
          </div>
          <div className="w-[1px] h-3 bg-white/5 mx-1"></div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-mono text-zinc-500">z:</span>
            <div className="flex items-center gap-1 relative">
              <span className="text-[9px] font-mono text-zinc-400">{depth.toFixed(1)}</span>
              <div className="w-1 h-3 bg-zinc-800/50 rounded-full flex items-center justify-center">
                <div className="w-[1px] h-2 bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 6: Dynamic Insight Generation Panel */}
      <AnimatePresence>
        {selectedNodeId && selectedInsights && (
          <motion.div
            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
            className="absolute bottom-6 right-6 w-80 neo-flat rounded-xl p-5 z-40 border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.1)] pointer-events-none"
          >
            <h3 className="text-orange-500 font-mono text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
              <BrainCircuit className="w-3.5 h-3.5" /> AI Graph Analytics
            </h3>

            <div className="space-y-4">
              {/* Centrality Scoring */}
              <div>
                <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Network className="w-3 h-3" /> Centrality Score
                </div>
                <div className="text-zinc-200 text-xs font-mono">
                  {selectedInsights.degree} Topological Edges (Degree)
                </div>
              </div>

              {/* Dimensional Embedding (Vectorization) */}
              <div>
                <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Activity className="w-3 h-3" /> Dimensional Proximity
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedInsights.similarities.length > 0 ? (
                    selectedInsights.similarities.map(sn => (
                      <span key={sn.id} className="text-[9px] px-2 py-1 rounded bg-white/5 text-zinc-300 border border-white/10 font-mono">
                        {sn.label} ({(sn.similarity * 100).toFixed(0)}%)
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] text-zinc-600 font-mono italic">No close semantic neighbors detected.</span>
                  )}
                </div>
              </div>

              {/* Dynamic Insight Suggestion */}
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 mt-2">
                <div className="text-[8px] text-orange-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Suggested Path
                </div>
                <div className="text-[10px] text-orange-200/80 leading-relaxed font-mono">
                  {selectedInsights.suggestion}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centered Origin Wrapper */}
      <div className="absolute top-1/2 left-1/2 w-0 h-0">
        <div 
          className="absolute inset-0 overflow-visible"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
        >
          <svg className="overflow-visible absolute inset-0 pointer-events-none z-10">
            {corpusLinks.map((link, i) => {
              const sourceNode = nodePositions.find(n => n.id === link.source);
              const targetNode = nodePositions.find(n => n.id === link.target);
              if (!sourceNode || !targetNode) return null;
              
              const isHighlighted = selectedNodeId === link.source || selectedNodeId === link.target || hoveredNodeId === link.source || hoveredNodeId === link.target;
              
              const sourceX = (sourceNode.pctX / 100) * dimensions.width;
              const sourceY = (sourceNode.pctY / 100) * dimensions.height;
              const targetX = (targetNode.pctX / 100) * dimensions.width;
              const targetY = (targetNode.pctY / 100) * dimensions.height;

              const midX = (sourceX + targetX) / 2;
              const midY = (sourceY + targetY) / 2;
              
              const dx = targetX - sourceX;
              const dy = targetY - sourceY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const curveOffset = dist * 0.15;
              
              const nx = -dy / dist;
              const ny = dx / dist;
              
              const dir = i % 2 === 0 ? 1 : -1;
              
              const cx = midX + nx * curveOffset * dir;
              const cy = midY + ny * curveOffset * dir;

              const pathData = `M ${sourceX} ${sourceY} Q ${cx} ${cy} ${targetX} ${targetY}`;

              return (
                <g key={i}>
                  <motion.path
                    animate={{ d: pathData }}
                    transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.8 }}
                    fill="none"
                    stroke={isHighlighted ? "rgba(200,106,42,0.4)" : "rgba(255,255,255,0.05)"}
                    strokeWidth={isHighlighted ? 2 : (link.type === 'explores' ? 1.5 : 1)}
                    className="transition-colors duration-300"
                  />
                  {isHighlighted && link.label && (
                    <motion.text
                      animate={{ x: cx, y: cy }}
                      transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.8 }}
                      fill="rgba(255,255,255,0.4)"
                      fontSize="8"
                      textAnchor="middle"
                      className="font-mono tracking-[0.2em] uppercase neo-text"
                    >
                      {link.label}
                    </motion.text>
                  )}
                </g>
              );
            })}
          </svg>

          {nodePositions.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            
            const nodeX = (node.pctX / 100) * dimensions.width;
            const nodeY = (node.pctY / 100) * dimensions.height;

            // STEP 4: Centrality Scaling
            // Scale the node visually based on its calculated degree (centrality)
            const degreeScale = 1 + ((node as any).degree * 0.04);
            const activeScale = isSelected || isHovered || expandedNodeId === node.id ? 1.15 : 1;
            const finalScale = degreeScale * activeScale;

            return (
              <motion.div 
                key={node.id} 
                className="absolute z-20"
                animate={{ x: nodeX, y: nodeY }}
                transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.8 }}
              >
                <div className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                  {/* Tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full mb-2 px-4 py-3 neo-flat rounded-xl text-[10px] whitespace-nowrap text-zinc-300 z-50 pointer-events-none min-w-[180px]"
                      >
                        <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/5">
                          <span className="text-orange-500/80 uppercase tracking-widest font-bold">{node.type}</span>
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(node.status)}
                            <span className="text-[8px] text-zinc-500 uppercase">{node.status}</span>
                          </div>
                        </div>
                        
                        <div className="text-zinc-100 font-medium mb-1">{node.label}</div>
                        
                        {node.confidence !== undefined && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-orange-500/60" 
                                style={{ width: `${node.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-[8px] text-zinc-500 font-mono">{(node.confidence * 100).toFixed(0)}% CONF</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: finalScale }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNodeSelect(node);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setExpandedNodeId(expandedNodeId === node.id ? null : node.id);
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className={cn(
                      getNodeStyle(node, isSelected, isHovered),
                      (isSelected || isHovered || expandedNodeId === node.id) && "z-30"
                    )}
                  >
                    <span className={cn(node.metadata?.geometry === 'diamond' && "-rotate-45 block")}>
                      {node.label}
                    </span>
                  </motion.button>

                  {/* Expanded Node Panel */}
                  <AnimatePresence>
                    {expandedNodeId === node.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="absolute top-full mt-4 w-72 neo-flat rounded-xl p-4 z-50 pointer-events-auto shadow-2xl border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                          <span className="text-xs text-orange-500/80 font-mono uppercase tracking-widest">{node.type}</span>
                          <button 
                            onClick={() => setExpandedNodeId(null)}
                            className="text-zinc-500 hover:text-zinc-300 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-sm text-zinc-100 font-medium mb-3">{node.label}</div>
                        <div className="text-xs text-zinc-400 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar pr-2 whitespace-pre-wrap">
                          {node.content || "No detailed content available for this node."}
                        </div>
                        {node.metadata?.tags && (
                          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-1.5">
                            {node.metadata.tags.map(tag => (
                              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 uppercase tracking-widest">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
