import { useMemo } from 'react';
import * as d3 from 'd3';
import { Node, Link } from '../data/corpus';

interface GraphLayoutOptions {
  nodes: Node[];
  links: Link[];
  depth: number;
  groupBy?: 'type' | 'status' | 'none';
}

export function useGraphLayout({ nodes, links, depth, groupBy = 'none' }: GraphLayoutOptions) {
  const nodePositions = useMemo(() => {
    if (nodes.length === 0) return [];

    // STEP 4: TOPOLOGY & CONNECTION LOGIC
    // Calculate Centrality (Degree) for each node to determine its gravitational weight
    const degrees = new Map<string, number>();
    links.forEach(l => {
      degrees.set(l.source, (degrees.get(l.source) || 0) + 1);
      degrees.set(l.target, (degrees.get(l.target) || 0) + 1);
    });

    // Create a copy of nodes and links for d3 to mutate
    const simNodes = nodes.map(n => ({
      ...n,
      x: 0, y: 0, vx: 0, vy: 0,
      degree: degrees.get(n.id) || 0
    }));

    const simLinks = links
      .filter(l => nodes.some(n => n.id === l.source) && nodes.some(n => n.id === l.target))
      .map(l => ({ ...l, source: l.source, target: l.target }));

    // STEP 5: FRONTEND VISUAL RENDERING (Force-Directed Physics)
    const simulation = d3.forceSimulation(simNodes as d3.SimulationNodeDatum[])
      // Charge: Central nodes repel more to create organic, readable spacing
      .force('charge', d3.forceManyBody().strength((d: any) => -400 * depth - (d.degree * 40)))
      .force('link', d3.forceLink(simLinks).id((d: any) => d.id).distance(120 * depth))
      .force('center', d3.forceCenter(0, 0))
      // Collision: Radius scales with centrality to prevent overlapping of major hubs
      .force('collide', d3.forceCollide().radius((d: any) => 45 + (d.degree * 5)));

    if (groupBy !== 'none') {
      // STEP 3: CATEGORICAL TAGGING (Visual Clustering)
      const groups = Array.from(new Set(nodes.map(n => String(n[groupBy] || 'unknown'))));
      const angleStep = (2 * Math.PI) / Math.max(groups.length, 1);
      const radius = 250 * depth;

      const groupCenters = new Map(groups.map((g, i) => [
        g,
        { x: Math.cos(i * angleStep) * radius, y: Math.sin(i * angleStep) * radius }
      ]));

      simulation.force('x', d3.forceX((d: any) => groupCenters.get(String(d[groupBy] || 'unknown'))?.x || 0).strength(0.6))
                .force('y', d3.forceY((d: any) => groupCenters.get(String(d[groupBy] || 'unknown'))?.y || 0).strength(0.6));
    } else {
      simulation.force('x', d3.forceX(0).strength(0.05))
                .force('y', d3.forceY(0).strength(0.05));
    }

    // Run simulation synchronously
    simulation.stop();
    for (let i = 0; i < 300; ++i) simulation.tick();

    // Find bounding box to normalize to percentages
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    simNodes.forEach(n => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const width = Math.max(maxX - minX, 1);
    const height = Math.max(maxY - minY, 1);
    const maxDim = Math.max(width, height);

    // Normalize to roughly -35% to +35% range to fit within the screen
    return simNodes.map(n => ({
      ...(n as Node),
      degree: n.degree,
      pctX: (n.x / maxDim) * 70, // -35 to 35
      pctY: (n.y / maxDim) * 70, // -35 to 35
    }));
  }, [nodes, links, depth, groupBy]);

  return { nodePositions };
}
