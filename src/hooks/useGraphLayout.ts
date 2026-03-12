import { useEffect, useRef, useState, useCallback } from 'react';
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

  // Filter nodes based on active filters
  // We memoize the filtered data to prevent unnecessary simulation restarts
  const getFilteredData = useCallback(() => {
    const filteredNodes = nodes.filter(n => {
      const typeMatch = activeFilters.types.size === 0 || activeFilters.types.has(n.type);
      const statusMatch = activeFilters.statuses.size === 0 || (n.status && activeFilters.statuses.has(n.status));
      return typeMatch && statusMatch;
    });

    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

    return { nodes: filteredNodes.map(n => ({ ...n })), links: filteredLinks.map(l => ({ ...l })) };
  }, [nodes, links, activeFilters]);

  useEffect(() => {
    const { nodes: simNodes, links: simLinks } = getFilteredData();

    // Calculate forces based on gravity (0 to 100)
    // High gravity = nodes pulled tightly together
    // Low gravity = nodes spread far apart
    const chargeStrength = clusterMode ? -100 : -300 * (1 - (gravity - 50) / 100);
    const linkDistance = clusterMode ? 50 : 100 * (1 - (gravity - 50) / 100);
    const centerStrength = gravity / 100; // 0 to 1

    // Initialize simulation
    const simulation = d3.forceSimulation(simNodes as d3.SimulationNodeDatum[])
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('link', d3.forceLink(simLinks).id((d: any) => d.id).distance(linkDistance))
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
      simulation.tick();
      setGraphData({ nodes: [...simNodes], links: [...simLinks] });
      requestRef.current = requestAnimationFrame(tick);
    };

    // Start loop
    requestRef.current = requestAnimationFrame(tick);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      simulation.stop();
    };
  }, [width, height, clusterMode, gravity, getFilteredData]); // Re-run when these change

  // Drag handlers
  const drag = (node: any) => {
    const simulation = simulationRef.current;
    if (!simulation) return { onDragStart: () => {}, onDrag: () => {}, onDragEnd: () => {} };

    const onDragStart = (event: any) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      node.fx = node.x;
      node.fy = node.y;
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
