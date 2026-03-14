/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Node, VoidBlock } from '../data/corpus';
import { File, Video, Link as LinkIcon, Plus, Search, X, Download, AlertCircle, CheckCircle2, FileText, FileJson, FileType } from 'lucide-react';
import { cn } from '../lib/utils';
import { exportEngine, ExportFormat } from '../utils/exportEngine';
import { VoidEditor } from './VoidEditor';
import { blocksToString, migrateContentToBlocks } from '../utils/voidUtils';

interface LibraryBrowserProps {
  nodes: Node[];
  addNode: (node: Node) => void;
  onNodeSelect: (node: Node) => void;
  selectedNodeId?: string;
}

export function LibraryBrowser({ nodes, addNode, onNodeSelect, selectedNodeId }: LibraryBrowserProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Form State
  const [newLabel, setNewLabel] = useState('');
  const [newBlocks, setNewBlocks] = useState<VoidBlock[]>([
    { id: 'init_block', type: 'text', content: '', metadata: { lastEdited: Date.now() } }
  ]);
  const [newUrl, setNewUrl] = useState('');
  const [newTags, setNewTags] = useState('');
  const [sourceType, setSourceType] = useState<'article' | 'video' | 'tweet' | 'paper'>('article');
  
  // Validation & Feedback State
  const [errors, setErrors] = useState<{label?: string; content?: string}>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const libraryItems = nodes.filter(n => n.type === 'library_item');

  const getIcon = (url?: string) => {
    if (!url) return <File className="w-4 h-4" />;
    if (url.includes('youtube') || url.includes('video')) return <Video className="w-4 h-4" />;
    return <LinkIcon className="w-4 h-4" />;
  };

  const validateForm = () => {
    const newErrors: {label?: string; content?: string} = {};
    if (!newLabel.trim()) newErrors.label = "Title is required to anchor the node.";
    if (newBlocks.every(b => !b.content.trim())) newErrors.content = "Content cannot be void (yet).";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;

    const newNode: Node = {
      id: `lib_${Date.now()}`,
      label: newLabel,
      type: 'library_item',
      status: 'RAW',
      blocks: newBlocks,
      metadata: {
        url: newUrl,
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
        date_added: new Date().toISOString().split('T')[0],
        geometry: 'square',
        chromatic_tag: sourceType // Storing source type in metadata for now
      }
    };

    addNode(newNode);
    
    // Reset & Feedback
    setIsAdding(false);
    setNewLabel('');
    setNewBlocks([{ id: `blk_${Date.now()}`, type: 'text', content: '', metadata: { lastEdited: Date.now() } }]);
    setNewUrl('');
    setNewTags('');
    setErrors({});
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleExport = (format: ExportFormat) => {
    exportEngine.export(libraryItems, format);
    setIsExporting(false);
  };

  return (
    <div className="flex flex-col h-full neo-bg p-8 font-sans relative">
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Ingestion Complete</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-2xl font-serif text-zinc-100 tracking-tight">The Library</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1 font-mono">The Void of Raw Information</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
            <input 
              type="text" 
              placeholder="Search the void..." 
              className="neo-pressed rounded-full py-2 pl-9 pr-4 text-[11px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none w-64"
            />
          </div>
          
          {/* Export Button */}
          <div className="relative">
            <button 
              onClick={() => setIsExporting(!isExporting)}
              className="w-10 h-10 rounded-full neo-convex flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all"
              title="Export Corpus"
            >
              <Download className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {isExporting && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsExporting(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 top-12 w-48 neo-flat border border-white/10 rounded-xl p-2 z-40 shadow-xl flex flex-col gap-1"
                  >
                    <div className="px-3 py-2 text-[10px] text-zinc-500 uppercase tracking-widest font-mono border-b border-white/5 mb-1">
                      Select Format
                    </div>
                    {[
                      { label: 'JSON Data', format: 'json', icon: FileJson },
                      { label: 'CSV Table', format: 'csv', icon: FileType },
                      { label: 'Markdown', format: 'md', icon: FileText },
                      { label: 'Plain Text', format: 'txt', icon: FileText },
                      { label: 'PDF Report', format: 'pdf', icon: File },
                      { label: 'Word Doc', format: 'docx', icon: File }
                    ].map((item) => (
                      <button
                        key={item.format}
                        onClick={() => handleExport(item.format as ExportFormat)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-zinc-200 transition-colors text-xs text-left"
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setIsAdding(true)}
            className="w-10 h-10 rounded-full neo-convex flex items-center justify-center text-orange-500/80 hover:text-orange-500 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar pr-4 pb-20">
        {libraryItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -4 }}
            onClick={() => onNodeSelect(item)}
            className={cn(
              "neo-flat rounded-3xl p-6 cursor-pointer border border-transparent transition-all duration-300 group",
              selectedNodeId === item.id ? "neo-pressed border-orange-500/20" : "hover:border-white/5"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl neo-convex flex items-center justify-center text-zinc-500 group-hover:text-orange-400 transition-colors">
                {getIcon(item.metadata?.url)}
              </div>
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{item.status}</span>
            </div>
            
            <h3 className="text-lg font-serif text-zinc-200 mb-2 group-hover:text-zinc-100 transition-colors">{item.label}</h3>
            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-4">
              {blocksToString(item.blocks)}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-auto">
              {item.metadata?.tags?.map((tag, i) => (
                <span key={i} className="text-[8px] uppercase tracking-widest px-2 py-1 rounded-full neo-convex text-zinc-600 font-mono">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/[0.02] flex items-center justify-between">
              <span className="text-[8px] text-zinc-600 font-mono">{item.metadata?.date_added}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                <span className="text-[8px] text-zinc-500 uppercase tracking-tighter">Ready for Transmutation</span>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Placeholder for "Add New" */}
        <div 
          onClick={() => setIsAdding(true)}
          className="neo-pressed rounded-3xl p-6 flex flex-col items-center justify-center border border-dashed border-white/5 opacity-40 hover:opacity-100 transition-opacity cursor-pointer group min-h-[200px]"
        >
          <Plus className="w-8 h-8 text-zinc-600 group-hover:text-orange-500 transition-colors mb-2" />
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Ingest New Data</span>
        </div>
      </div>

      {/* Add New Modal */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 rounded-3xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[80vh] neo-flat border border-white/10 rounded-3xl p-8 z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h3 className="text-xl font-serif text-zinc-100">Ingest New Data</h3>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="w-8 h-8 rounded-full neo-convex flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1.5 block">Title / Label *</label>
                  <input 
                    type="text" 
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className={cn(
                      "w-full neo-pressed rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 transition-all",
                      errors.label ? "ring-1 ring-red-500/50" : "focus:ring-orange-500/50"
                    )}
                    placeholder="e.g., The Architecture of Silence"
                  />
                  {errors.label && (
                    <div className="flex items-center gap-1 mt-1 text-red-500 text-[10px]">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1.5 block">Source Type</label>
                  <div className="flex gap-2">
                    {['article', 'video', 'tweet', 'paper'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSourceType(type as any)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-mono transition-all",
                          sourceType === type 
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" 
                            : "neo-convex text-zinc-600 hover:text-zinc-400"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-[300px]">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1.5 block">Content Blocks *</label>
                  <div className="flex-1 neo-pressed rounded-xl p-4 border border-white/5">
                    <VoidEditor 
                      initialBlocks={newBlocks} 
                      nodes={nodes} 
                      onChange={setNewBlocks} 
                    />
                  </div>
                  {errors.content && (
                    <div className="flex items-center gap-1 mt-1 text-red-500 text-[10px]">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.content}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1.5 block">Source URL (Optional)</label>
                  <input 
                    type="text" 
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full neo-pressed rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1.5 block">Tags (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full neo-pressed rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                    placeholder="void, architecture, silence"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end shrink-0 border-t border-white/5 mt-4">
                <button 
                  onClick={handleAdd}
                  className="px-6 py-2 rounded-xl bg-orange-500 text-black font-medium text-sm hover:bg-orange-400 transition-colors shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                >
                  Ingest into Void
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
