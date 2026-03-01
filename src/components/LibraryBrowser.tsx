/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { corpusNodes, Node } from '../data/corpus';
import { File, Video, Link as LinkIcon, Plus, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

interface LibraryBrowserProps {
  onNodeSelect: (node: Node) => void;
  selectedNodeId?: string;
}

export function LibraryBrowser({ onNodeSelect, selectedNodeId }: LibraryBrowserProps) {
  const libraryItems = corpusNodes.filter(n => n.type === 'library_item');

  const getIcon = (url?: string) => {
    if (!url) return <File className="w-4 h-4" />;
    if (url.includes('youtube') || url.includes('video')) return <Video className="w-4 h-4" />;
    return <LinkIcon className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col h-full neo-bg p-8 font-sans">
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
          <button className="w-10 h-10 rounded-full neo-convex flex items-center justify-center text-orange-500/80 hover:text-orange-500 transition-all">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar pr-4">
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
            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-4">{item.content}</p>
            
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
        <div className="neo-pressed rounded-3xl p-6 flex flex-col items-center justify-center border border-dashed border-white/5 opacity-40 hover:opacity-100 transition-opacity cursor-pointer group">
          <Plus className="w-8 h-8 text-zinc-600 group-hover:text-orange-500 transition-colors mb-2" />
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Ingest New Data</span>
        </div>
      </div>
    </div>
  );
}
