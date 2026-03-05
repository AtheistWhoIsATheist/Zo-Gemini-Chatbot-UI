
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VoidBlock, Node } from '../data/corpus';
import { cn } from '../lib/utils';
import { 
  Type, Code, CheckSquare, Hash, 
  MoreVertical, Trash2, GripVertical, 
  Maximize2, Minimize2, Link as LinkIcon 
} from 'lucide-react';
import Markdown from 'react-markdown';

interface VoidEditorProps {
// ...
  initialBlocks: VoidBlock[];
  nodes: Node[]; // For wiki-linking context
  onChange: (blocks: VoidBlock[]) => void;
  readOnly?: boolean;
}

export function VoidEditor({ initialBlocks, nodes, onChange, readOnly = false }: VoidEditorProps) {
  const [blocks, setBlocks] = useState<VoidBlock[]>(initialBlocks);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [slashMenu, setSlashMenu] = useState<{ x: number; y: number; blockId: string } | null>(null);
  const [linkMenu, setLinkMenu] = useState<{ x: number; y: number; blockId: string; query: string } | null>(null);

  // Sync internal state with props if they change externally (e.g. selection change)
  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  // Focus Mode Toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === '\\') {
        e.preventDefault();
        setFocusMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateBlock = (id: string, content: string) => {
    const newBlocks = blocks.map(b => 
      b.id === id ? { ...b, content, metadata: { ...b.metadata, lastEdited: Date.now() } } : b
    );
    setBlocks(newBlocks);
    onChange(newBlocks);

    // Check for triggers
    const block = newBlocks.find(b => b.id === id);
    if (!block) return;

    // Slash Command Trigger
    if (content.endsWith('/')) {
      // Find cursor position (simplified)
      const el = document.getElementById(`editor-${id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSlashMenu({ x: rect.left, y: rect.bottom + 5, blockId: id });
      }
    } else {
      setSlashMenu(null);
    }

    // Wiki Link Trigger
    const linkMatch = content.match(/\[\[([^\]]*)$/);
    if (linkMatch) {
      const el = document.getElementById(`editor-${id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        setLinkMenu({ x: rect.left + 20, y: rect.bottom + 5, blockId: id, query: linkMatch[1] });
      }
    } else {
      setLinkMenu(null);
    }
  };

  const addBlock = (afterId: string, type: VoidBlock['type'] = 'text') => {
    const index = blocks.findIndex(b => b.id === afterId);
    const newBlock: VoidBlock = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      content: '',
      metadata: { lastEdited: Date.now() }
    };
    
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    onChange(newBlocks);
    setActiveBlockId(newBlock.id);
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return; // Prevent deleting last block
    const newBlocks = blocks.filter(b => b.id !== id);
    setBlocks(newBlocks);
    onChange(newBlocks);
  };

  const changeBlockType = (id: string, type: VoidBlock['type']) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, type } : b);
    setBlocks(newBlocks);
    onChange(newBlocks);
    setSlashMenu(null);
    
    // Remove the trailing slash from content if it exists
    const block = newBlocks.find(b => b.id === id);
    if (block && block.content.endsWith('/')) {
      updateBlock(id, block.content.slice(0, -1));
    }
  };

  const insertLink = (targetNode: Node) => {
    if (!linkMenu) return;
    const block = blocks.find(b => b.id === linkMenu.blockId);
    if (!block) return;

    const newContent = block.content.replace(/\[\[([^\]]*)$/, `[[${targetNode.label}]]`);
    updateBlock(block.id, newContent);
    setLinkMenu(null);
  };

  return (
    <div className={cn(
      "relative w-full h-full flex flex-col transition-all duration-500",
      focusMode ? "fixed inset-0 z-50 bg-[#050505] p-20" : ""
    )}>
      {/* Focus Mode Overlay */}
      {focusMode && (
        <div className="absolute top-8 right-8 text-zinc-600 text-xs font-mono animate-pulse">
          FOCUS MODE ACTIVE [CMD + \]
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-20">
        {blocks.map((block) => (
          <motion.div
            layout
            key={block.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "group relative rounded-xl transition-all duration-300 border border-transparent",
              activeBlockId === block.id 
                ? "bg-white/[0.02] backdrop-blur-sm border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]" 
                : "hover:bg-white/[0.01]"
            )}
          >
            {/* Block Controls (Hover) */}
            {!readOnly && (
              <div className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button 
                  onClick={() => addBlock(block.id)}
                  className="p-1.5 text-zinc-600 hover:text-orange-400 rounded hover:bg-white/5"
                >
                  <GripVertical className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => removeBlock(block.id)}
                  className="p-1.5 text-zinc-600 hover:text-red-400 rounded hover:bg-white/5"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Content Area */}
            <div className="p-4 pl-6 relative">
              {block.type === 'heading' && <Hash className="absolute left-2 top-5 w-3 h-3 text-orange-500/50" />}
              {block.type === 'code' && <Code className="absolute left-2 top-5 w-3 h-3 text-blue-500/50" />}
              {block.type === 'todo' && <CheckSquare className="absolute left-2 top-5 w-3 h-3 text-emerald-500/50" />}
              

              {readOnly ? (
                <div className={cn(
                  "text-zinc-300 font-serif leading-relaxed whitespace-pre-wrap",
                  block.type === 'heading' && "text-2xl font-bold text-zinc-100",
                  block.type === 'code' && "font-mono text-sm bg-black/50 p-4 rounded-lg text-zinc-400",
                  block.type === 'todo' && "flex items-center gap-2"
                )}>

                  {block.type === 'text' ? (
                    <div className="prose prose-invert max-w-none">
                      <Markdown>{block.content}</Markdown>
                    </div>
                  ) : (
                    block.content
                  )}
                </div>
              ) : (
                <textarea
                  id={`editor-${block.id}`}
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, e.target.value)}
                  onFocus={() => setActiveBlockId(block.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      addBlock(block.id);
                    }
                    if (e.key === 'Backspace' && block.content === '' && blocks.length > 1) {
                      e.preventDefault();
                      removeBlock(block.id);
                    }
                  }}
                  className={cn(
                    "w-full bg-transparent border-none focus:ring-0 resize-none outline-none text-zinc-300 font-serif leading-relaxed",
                    block.type === 'heading' && "text-2xl font-bold text-zinc-100 placeholder:text-zinc-700",
                    block.type === 'code' && "font-mono text-sm bg-black/50 p-4 rounded-lg text-zinc-400",
                    block.type === 'todo' && "pl-2"
                  )}
                  placeholder={
                    block.type === 'heading' ? "Heading..." : 
                    block.type === 'code' ? "Code snippet..." : 
                    "Type '/' for commands..."
                  }
                  rows={block.type === 'code' ? 4 : 1}
                  style={{ minHeight: '1.5em', height: 'auto' }}
                  // Auto-resize logic would go here
                />
              )}
            </div>
          </motion.div>
        ))}
        
        {!readOnly && (
          <div 
            onClick={() => addBlock(blocks[blocks.length - 1].id)}
            className="h-20 flex items-center justify-center text-zinc-700 hover:text-zinc-500 cursor-text transition-colors"
          >
            <span className="text-xs font-mono uppercase tracking-widest opacity-0 hover:opacity-100">Click to append</span>
          </div>
        )}
      </div>

      {/* Slash Menu */}
      <AnimatePresence>
        {slashMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setSlashMenu(null)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ top: slashMenu.y, left: slashMenu.x }}
              className="fixed z-50 w-48 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-3 py-2 text-[10px] text-zinc-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.02]">
                Block Type
              </div>
              {[
                { type: 'text', icon: Type, label: 'Text' },
                { type: 'heading', icon: Hash, label: 'Heading' },
                { type: 'code', icon: Code, label: 'Code Block' },
                { type: 'todo', icon: CheckSquare, label: 'To-Do List' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => changeBlockType(slashMenu.blockId, item.type as any)}
                  className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 text-xs transition-colors text-left"
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Wiki Link Menu */}
      <AnimatePresence>
        {linkMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setLinkMenu(null)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ top: linkMenu.y, left: linkMenu.x }}
              className="fixed z-50 w-64 bg-[#111] border border-orange-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-64"
            >
              <div className="px-3 py-2 text-[10px] text-orange-500 uppercase tracking-widest border-b border-white/5 bg-orange-500/[0.05] flex items-center gap-2">
                <LinkIcon className="w-3 h-3" />
                Link to Node
              </div>
              <div className="overflow-y-auto custom-scrollbar">
                {nodes
                  .filter(n => n.label.toLowerCase().includes(linkMenu.query.toLowerCase()))
                  .map((node) => (
                    <button
                      key={node.id}
                      onClick={() => insertLink(node)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 text-xs transition-colors text-left border-b border-white/[0.02]"
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        node.type === 'concept' ? "bg-red-500" : 
                        node.type === 'thinker' ? "bg-blue-500" : "bg-zinc-500"
                      )} />
                      <span className="truncate">{node.label}</span>
                    </button>
                  ))}
                  {nodes.filter(n => n.label.toLowerCase().includes(linkMenu.query.toLowerCase())).length === 0 && (
                    <div className="px-3 py-4 text-center text-zinc-600 text-xs italic">
                      No matching voids found...
                    </div>
                  )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
