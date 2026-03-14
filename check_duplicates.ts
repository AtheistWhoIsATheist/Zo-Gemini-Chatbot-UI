import { corpusNodes } from './src/data/corpus.ts';

const ids = corpusNodes.map(n => n.id);
const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
console.log("Duplicates:", duplicates);
