/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { DocumentViewer } from './components/DocumentViewer';
import { Chatbot } from './components/Chatbot';
import { LibraryBrowser } from './components/LibraryBrowser';
import { SummaryFeed } from './components/SummaryFeed';
import { RevelationDigest } from './components/RevelationDigest';
import { Node, corpusNodes as initialCorpusNodes } from './data/corpus';
import { Network, FileText, Database, Hexagon, ChevronLeft, ChevronRight, Library, Sparkles, Eye } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';

export default function App() {
  const [nodes, setNodes] = useState<Node[]>(initialCorpusNodes);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'document' | 'library' | 'summaries' | 'revelation'>('graph');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [showDbToast, setShowDbToast] = useState(false);

  const handleNodeSelect = useCallback((node: Node) => {
    setSelectedNode(node);
    if (node.content) {
      setViewMode('document');
    }
  }, []);

  const addNode = useCallback(async (node: Node) => {
    setNodes(prev => [...prev, node]);
    try {
      await fetch('/api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(node)
      });
    } catch (err) {
      console.error('Failed to sync node to backend:', err);
    }
  }, []);

  return (
    <LayoutGroup>
      <div className="flex h-screen w-full neo-bg text-zinc-300 overflow-hidden selection:bg-orange-500/30 relative">
        
        {/* Left Sidebar */}
        <motion.div 
          layout
          animate={{ 
            width: isSidebarCollapsed ? '16px' : '8%', 
            minWidth: isSidebarCollapsed ? '16px' : '80px' 
          }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="h-full shrink-0 relative z-30 flex"
        >
          <div className="w-full h-full neo-flat border-r-0 relative flex flex-col items-center py-8 overflow-hidden">
            <motion.div 
              animate={{ opacity: isSidebarCollapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center w-full min-w-[80px]"
            >
              <button className="w-12 h-12 rounded-2xl neo-convex flex items-center justify-center text-zinc-300 mb-12 hover:text-orange-400 transition-all">
                <Hexagon className="w-6 h-6 text-orange-500/80" strokeWidth={1.5} />
              </button>
              
              <div className="flex flex-col gap-6 w-full items-center">
                <button 
                  onClick={() => setViewMode('graph')}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                    viewMode === 'graph' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
                  )}
                  title="Knowledge Graph"
                >
                  <Network className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button 
                  onClick={() => setViewMode('library')}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                    viewMode === 'library' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
                  )}
                  title="Library Browser"
                >
                  <Library className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button 
                  onClick={() => setViewMode('summaries')}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                    viewMode === 'summaries' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
                  )}
                  title="Summary Feed"
                >
                  <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button 
                  onClick={() => setViewMode('revelation')}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                    viewMode === 'revelation' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
                  )}
                  title="The Shifting Void (Weekly Digest)"
                >
                  <Eye className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button 
                  onClick={() => {
                    if (selectedNode?.content) setViewMode('document');
                  }}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                    viewMode === 'document' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300",
                    !selectedNode?.content && "opacity-30 cursor-not-allowed"
                  )}
                  title="Document Viewer"
                >
                  <FileText className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button 
                  onClick={() => {
                    setShowDbToast(true);
                    setTimeout(() => setShowDbToast(false), 3000);
                  }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center neo-convex text-zinc-500 hover:text-zinc-300 hover:text-orange-400 transition-all cursor-pointer relative" 
                  title="Corpus Database Active"
                >
                  <Database className="w-5 h-5" strokeWidth={1.5} />
                  {/* Active indicator dot */}
                  <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                </button>
              </div>
            </motion.div>
          </div>
          
          {/* Toggle Button */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-8 w-6 h-6 rounded-full neo-convex flex items-center justify-center text-orange-500/60 hover:text-orange-500 transition-colors z-40"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-3 h-3" strokeWidth={3} />
            ) : (
              <ChevronLeft className="w-3 h-3" strokeWidth={3} />
            )}
          </button>
        </motion.div>

        {/* Middle Content Area */}
        <motion.div layout className="flex-1 relative z-10 h-full overflow-hidden">
          {viewMode === 'graph' ? (
            <KnowledgeGraph 
              nodes={nodes}
              onNodeSelect={handleNodeSelect} 
              selectedNodeId={selectedNode?.id} 
            />
          ) : viewMode === 'library' ? (
            <LibraryBrowser 
              nodes={nodes}
              addNode={addNode}
              onNodeSelect={handleNodeSelect} 
              selectedNodeId={selectedNode?.id} 
            />
          ) : viewMode === 'summaries' ? (
            <SummaryFeed 
              nodes={nodes}
              onNodeSelect={handleNodeSelect} 
              selectedNodeId={selectedNode?.id} 
            />
          ) : viewMode === 'revelation' ? (
            <RevelationDigest />
          ) : (
            selectedNode && <DocumentViewer node={selectedNode} />
          )}
        </motion.div>

        {/* Right Sidebar - Chatbot */}
        <motion.div 
          layout
          animate={{ width: isChatCollapsed ? '16px' : '47%' }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="h-full shrink-0 relative z-20 flex"
        >
          {/* Toggle Button */}
          <button 
            onClick={() => setIsChatCollapsed(!isChatCollapsed)}
            className="absolute -left-3 top-8 w-6 h-6 rounded-full neo-convex flex items-center justify-center text-orange-500/60 hover:text-orange-500 transition-colors z-40"
          >
            {isChatCollapsed ? (
              <ChevronLeft className="w-3 h-3" strokeWidth={3} />
            ) : (
              <ChevronRight className="w-3 h-3" strokeWidth={3} />
            )}
          </button>

          <div className="w-full h-full neo-flat border-l-0 overflow-hidden">
            <motion.div 
              animate={{ opacity: isChatCollapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full min-w-[400px]"
            >
              <Chatbot nodes={nodes} onCollapse={() => setIsChatCollapsed(true)} />
            </motion.div>
          </div>
        </motion.div>

        {/* Database Status Toast */}
        <AnimatePresence>
          {showDbToast && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-6 left-24 z-50 bg-black/80 backdrop-blur-xl border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.15)] flex items-center gap-3 pointer-events-none"
            >
              <Database className="w-4 h-4" />
              <div>
                <div className="font-bold text-white mb-0.5">Corpus Database</div>
                <div className="opacity-80">100% Saturated • All Nodes Synced</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </LayoutGroup>
  );
}
