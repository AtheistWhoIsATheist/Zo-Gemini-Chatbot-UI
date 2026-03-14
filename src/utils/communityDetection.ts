import jLouvain from 'jlouvain';
import { Node, Link } from '../data/corpus';

export interface Community {
  id: number;
  nodes: Node[];
  label?: string;
  summary?: string;
}

export function detectCommunities(nodes: Node[], links: Link[]): Community[] {
  if (!nodes || nodes.length === 0) return [];

  const nodeIds = nodes.map(n => n.id);
  const edgeData = links.map(l => ({
    source: typeof l.source === 'string' ? l.source : (l.source as any).id,
    target: typeof l.target === 'string' ? l.target : (l.target as any).id,
    weight: 1.0
  }));

  const community = jLouvain().nodes(nodeIds).edges(edgeData);
  const result = community();

  const communitiesMap = new Map<number, Node[]>();
  
  for (const [nodeId, communityId] of Object.entries(result)) {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      if (!communitiesMap.has(communityId as number)) {
        communitiesMap.set(communityId as number, []);
      }
      communitiesMap.get(communityId as number)!.push(node);
    }
  }

  return Array.from(communitiesMap.entries()).map(([id, nodes]) => ({
    id,
    nodes
  }));
}
