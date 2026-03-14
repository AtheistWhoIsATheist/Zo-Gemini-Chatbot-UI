import { corpusNodes } from './src/data/corpus.ts';

const duplicateTags = corpusNodes.filter(n => {
  if (!n.metadata || !n.metadata.tags) return false;
  const tags = n.metadata.tags;
  return new Set(tags).size !== tags.length;
});

console.log("Nodes with duplicate tags:", duplicateTags.map(n => n.id));
