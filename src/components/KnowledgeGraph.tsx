/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { corpusNodes, corpusLinks, Node } from '../data/corpus';
import { cn } from '../lib/utils';
import { Hand, Maximize, RotateCcw, ZoomIn } from 'lucide-react';

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
    if (e.button === 0) { // Left click
      setIsPanning(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomSpeed = 0.001;
      const newScale = Math.max(0.5, Math.min(3, scale - e.deltaY * zoomSpeed));
      setScale(newScale);
    } else {
      // Depth or Pan
      const depthSpeed = 0.001;
      setDepth(prev => Math.max(0.5, Math.min(2.5, prev - e.deltaY * depthSpeed)));
    }
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setDepth(1.2);
  };

  // Elliptical layout calculation
  const centerX = (dimensions.width / 2) + offset.x;
  const centerY = (dimensions.height / 2) + offset.y;
  const radiusX = (dimensions.width / 2) * 0.65 * depth * scale;
  const radiusY = (dimensions.height / 2) * 0.65 * depth * scale;

  const nodePositions = corpusNodes.map((node, index) => {
    const angle = (index / corpusNodes.length) * 2 * Math.PI;
    return {
      ...node,
      x: centerX + radiusX * Math.cos(angle),
      y: centerY + radiusY * Math.sin(angle),
    };
  });

  const highlightedNodes = ['spiritual_emergency', 'void', 'collapse', 'anpes', 'ethics'];
  
  const getNodeStyle = (id: string, isSelected: boolean, isHovered: boolean) => {
    if (highlightedNodes.includes(id)) {
      return cn(
        "bg-orange-500/5 border border-orange-500/40 text-orange-400 backdrop-blur-xl shadow-[inset_0_0_20px_rgba(200,106,42,0.1)]",
        (isSelected || isHovered) && "ring-1 ring-orange-400 ring-offset-2 ring-offset-[#030303] bg-orange-500/10"
      );
    }
    return cn(
      "bg-zinc-900/20 border border-zinc-800/40 border-dotted text-zinc-500 backdrop-blur-md shadow-[inset_0_0_10px_rgba(0,0,0,0.3)]",
      (isSelected || isHovered) && "ring-1 ring-zinc-500 ring-offset-2 ring-offset-[#030303] text-zinc-300 border-solid bg-zinc-800/40"
    );
  };

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "relative w-full h-full overflow-hidden bg-transparent transition-all duration-300",
        isPanning ? "cursor-grabbing" : "cursor-default"
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Parallax Background Layer */}
      <motion.div 
        animate={{ 
          scale: (1 + (depth - 1) * 0.15) * scale,
          opacity: 0.25 + (depth - 1) * 0.05,
          x: ((depth - 1) * 20) + (offset.x * 0.2),
          y: ((depth - 1) * 20) + (offset.y * 0.2)
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0 cosmic-void pointer-events-none z-0"
      />

      {/* Graph Controls Micro-toolbar */}
      <div className="absolute top-6 right-6 z-50 flex flex-col items-end gap-2">
        <div className="glass-chip flex items-center gap-4 px-3 py-2">
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
          <div className="w-[1px] h-3 bg-white/10 mx-1"></div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-mono text-zinc-500">z:</span>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono text-zinc-400">{depth.toFixed(1)}</span>
              <div className="w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.8)]"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 opacity-40">
          <span className="text-[8px] uppercase tracking-tighter text-zinc-500">Left-click + Drag to Pan</span>
          <span className="text-[8px] uppercase tracking-tighter text-zinc-500">Ctrl + Scroll to Zoom</span>
          <span className="text-[8px] uppercase tracking-tighter text-zinc-500">Scroll to adjust Depth</span>
        </div>
      </div>

      {/* Cursor Affordance */}
      <div className="absolute bottom-8 left-8 z-20 flex items-center gap-3 opacity-30">
        <Hand className="w-4 h-4 text-zinc-500" />
        <div className="h-[1px] w-12 bg-zinc-800 relative">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-orange-500 rounded-full"></div>
        </div>
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {corpusLinks.map((link, i) => {
          const sourceNode = nodePositions.find(n => n.id === link.source);
          const targetNode = nodePositions.find(n => n.id === link.target);
          if (!sourceNode || !targetNode) return null;
          
          const isHighlighted = selectedNodeId === link.source || selectedNodeId === link.target || hoveredNodeId === link.source || hoveredNodeId === link.target;
          
          return (
            <g key={i}>
              <line
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={isHighlighted ? "rgba(200,106,42,0.3)" : "rgba(255,255,255,0.08)"}
                className="hairline transition-colors duration-300"
              />
              {isHighlighted && link.label && (
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2}
                  fill="rgba(255,255,255,0.25)"
                  fontSize="8"
                  textAnchor="middle"
                  className="font-mono tracking-[0.2em] uppercase"
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
        const isHovered = hoveredNodeId === node.id;
        return (
          <div key={node.id} className="absolute" style={{ left: node.x, top: node.y }}>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: isSelected || isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              onClick={(e) => {
                e.stopPropagation();
                onNodeSelect(node);
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={cn(
                "transform -translate-x-1/2 -translate-y-1/2 px-6 py-2.5 rounded-full text-[10px] font-mono whitespace-nowrap transition-all duration-300 cursor-pointer tracking-widest uppercase z-20",
                getNodeStyle(node.id, isSelected, isHovered),
                (isSelected || isHovered) && "z-30"
              )}
            >
              {node.label}
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-1.5 glass-card rounded-lg text-[10px] whitespace-nowrap text-zinc-300 z-50 pointer-events-none"
                >
                  <span className="text-orange-500/80 mr-2">●</span>
                  {node.label}
                  <div className="text-[8px] text-zinc-500 mt-0.5 uppercase tracking-tighter">{node.type}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
