
import { Node } from '../data/corpus';
import { VoidEditor } from './VoidEditor';

export function DocumentViewer({ node }: { node: Node }) {
  if (!node.blocks || node.blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-600 font-mono text-sm">
        [FRAGMENT MISSING FROM THE VOID]
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 h-full overflow-y-auto custom-scrollbar">
      <div className="mb-8 pb-4 border-b border-zinc-800 mt-12">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{node.type}</span>
        <h1 className="text-3xl font-serif text-zinc-100 mt-2">{node.label}</h1>
      </div>
      <div className="prose prose-invert prose-zinc max-w-none font-serif leading-relaxed text-zinc-300">
        <VoidEditor 
          initialBlocks={node.blocks} 
          nodes={[]} // No linking context needed for read-only
          onChange={() => {}} 
          readOnly={true} 
        />
      </div>
    </div>
  );
}
