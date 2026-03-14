import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Node, Link, NodeType } from '../data/corpus';

interface GraphLayoutOptions {
  nodes: Node[];
  links: Link[];
  width: number;
  height: number;
  clusterMode: boolean;
  gravity: number; // 0 to 100
  activeFilters: {
    types: Set<string>;
    statuses: Set<string>;
  };
}

// Define cluster focal points for specific node types
const CLUSTER_CENTERS: Partial<Record<NodeType, { x: number; y: number }>> = {
  treatise: { x: 0, y: -300 },      // North
  thinker: { x: -300, y: 200 },     // South-West
  concept: { x: 300, y: 200 },      // South-East
  journal: { x: -200, y: -200 },    // North-West
  experience: { x: 200, y: -200 },  // North-East
  question: { x: 0, y: 400 },       // South
  axiom: { x: -400, y: 0 },         // West
  praxis: { x: 400, y: 0 },         // East
  // Default center for others is (0,0)
};

export function useGraphLayout({ nodes, links, width, height, clusterMode, gravity, activeFilters }: GraphLayoutOptions) {
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);
  const requestRef = useRef<number | null>(null);
  const nodesMapRef = useRef<Map<string, any>>(new Map());

  // Stringify filters to use as a stable dependency
  const filterKey = useMemo(() => {
    return JSON.stringify({
      types: Array.from(activeFilters.types).sort(),
      statuses: Array.from(activeFilters.statuses).sort()
    });
  }, [activeFilters]);

  useEffect(() => {
    if (width === 0 || height === 0) return;

    // Filter nodes based on active filters
    const filteredNodes = nodes.filter(n => {
      const typeMatch = activeFilters.types.size === 0 || activeFilters.types.has(n.type);
      const statusMatch = activeFilters.statuses.size === 0 || (n.status && activeFilters.statuses.has(n.status));
      return typeMatch && statusMatch;
    });

    const nodeIds = new Set(filteredNodes.map(n => n.id));
    
    // Filter and normalize links
    const filteredLinks = links
      .filter(l => {
        const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
        const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
        return nodeIds.has(s) && nodeIds.has(t);
      })
      .map(l => ({
        ...l,
        source: typeof l.source === 'string' ? l.source : (l.source as any).id,
        target: typeof l.target === 'string' ? l.target : (l.target as any).id
      }));

    // Preserve positions from previous simulation
    const simNodes = filteredNodes.map(n => {
      const existing = nodesMapRef.current.get(n.id);
      return {
        ...n,
        x: existing?.x ?? width / 2 + (Math.random() - 0.5) * 100,
        y: existing?.y ?? height / 2 + (Math.random() - 0.5) * 100,
        vx: existing?.vx ?? 0,
        vy: existing?.vy ?? 0,
        fx: existing?.fx,
        fy: existing?.fy
      };
    });

    // Calculate forces based on gravity (0 to 100)
    const chargeStrength = clusterMode ? -100 : -300 * (1 - (gravity - 50) / 100);
    const linkDistance = clusterMode ? 50 : 100 * (1 - (gravity - 50) / 100);
    const centerStrength = gravity / 100; // 0 to 1

    // Initialize simulation
    const simulation = d3.forceSimulation(simNodes as d3.SimulationNodeDatum[])
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('link', d3.forceLink(filteredLinks).id((d: any) => d.id).distance(linkDistance))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(centerStrength))
      .force('collide', d3.forceCollide().radius(40).iterations(2));

    // Apply clustering forces if enabled
    if (clusterMode) {
      simulation.force('x', d3.forceX((d: any) => {
        const center = CLUSTER_CENTERS[d.type as NodeType];
        return (center?.x || 0) + width / 2;
      }).strength(0.3 * (gravity / 50)));
      
      simulation.force('y', d3.forceY((d: any) => {
        const center = CLUSTER_CENTERS[d.type as NodeType];
        return (center?.y || 0) + height / 2;
      }).strength(0.3 * (gravity / 50)));
    } else {
      simulation.force('x', null);
      simulation.force('y', null);
    }

    simulationRef.current = simulation;

    // Animation loop
    const tick = () => {
      // Save current positions to ref
      simNodes.forEach(n => nodesMapRef.current.set(n.id, n));
      
      setGraphData({ nodes: [...simNodes], links: [...filteredLinks] });
      
      // Only continue animation if simulation is still active
      if (simulation.alpha() > 0.01) {
        requestRef.current = requestAnimationFrame(tick);
      }
    };

    // Start loop
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(tick);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      simulation.stop();
    };
  }, [nodes, links, width, height, clusterMode, gravity, filterKey]); // Use filterKey instead of activeFilters

  // Drag handlers
  const drag = (node: any) => {
    const simulation = simulationRef.current;
    if (!simulation) return { onDragStart: () => {}, onDrag: () => {}, onDragEnd: () => {} };

    const onDragStart = (event: any) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      node.fx = node.x;
      node.fy = node.y;
      
      // Restart animation loop if it was stopped
      if (simulation.alpha() <= 0.01) {
        const tick = () => {
          setGraphData(prev => ({ nodes: [...prev.nodes], links: [...prev.links] }));
          if (simulation.alpha() > 0.01) {
            requestRef.current = requestAnimationFrame(tick);
          }
        };
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(tick);
      }
    };

    const onDrag = (event: any) => {
      node.fx = event.x;
      node.fy = event.y;
    };

    const onDragEnd = (event: any) => {
      if (!event.active) simulation.alphaTarget(0);
      node.fx = null;
      node.fy = null;
    };

    return { onDragStart, onDrag, onDragEnd };
  };

  return { nodes: graphData.nodes, links: graphData.links, drag };
}
