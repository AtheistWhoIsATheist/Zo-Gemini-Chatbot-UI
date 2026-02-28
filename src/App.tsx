import { useState } from 'react';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { DocumentViewer } from './components/DocumentViewer';
import { Chatbot } from './components/Chatbot';
import { Node } from './data/corpus';
import { Network, FileText, Database, Hexagon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'document'>('graph');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  const handleNodeSelect = (node: Node) => {
    setSelectedNode(node);
    if (node.content) {
      setViewMode('document');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#030303] text-zinc-300 overflow-hidden selection:bg-orange-500/30 micro-noise relative">
      {/* Ambient background glow */}
      <div className="absolute inset-0 cosmic-void pointer-events-none"></div>
      
      {/* Left Sidebar (~8%) */}
      <AnimatePresence mode="wait">
        {!isSidebarCollapsed ? (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '8%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="min-w-[80px] flex flex-col items-center py-8 glass-rail z-30 relative"
          >
            {/* Collapse Toggle */}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarCollapsed(true)}
              className="absolute -right-3 top-8 w-6 h-6 rounded-full glass-card flex items-center justify-center text-orange-500/60 hover:text-orange-500 transition-colors z-40 border-white/[0.1] shadow-[0_0_10px_rgba(200,106,42,0.2)]"
            >
              <ChevronLeft className="w-3 h-3" strokeWidth={3} />
            </motion.button>

            <button className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-zinc-300 mb-12 hover:bg-white/[0.06] transition-all border-white/[0.1]">
              <Hexagon className="w-6 h-6 text-orange-500/80" strokeWidth={1.5} />
            </button>
            
            <div className="flex flex-col gap-6 w-full items-center">
              <button 
                onClick={() => setViewMode('graph')}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                  viewMode === 'graph' ? "glass-card text-orange-400 border-orange-500/30 shadow-[0_0_15px_rgba(200,106,42,0.1)]" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                )}
                title="Knowledge Graph"
              >
                <Network className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => {
                  if (selectedNode?.content) setViewMode('document');
                }}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                  viewMode === 'document' ? "glass-card text-orange-400 border-orange-500/30 shadow-[0_0_15px_rgba(200,106,42,0.1)]" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]",
                  !selectedNode?.content && "opacity-30 cursor-not-allowed"
                )}
                title="Document Viewer"
              >
                <FileText className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all cursor-pointer" title="Corpus Database Active">
                <Database className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-4 h-full glass-rail flex items-start justify-center pt-8 z-30"
          >
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-6 h-6 rounded-full glass-card flex items-center justify-center text-orange-500/60 hover:text-orange-500 transition-colors border-white/[0.1] shadow-[0_0_10px_rgba(200,106,42,0.2)]"
            >
              <ChevronRight className="w-3 h-3" strokeWidth={3} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Middle Content Area (~45%) */}
      <div className={cn(
        "flex-1 relative z-10 border-r border-white/[0.03] transition-all duration-400",
        isSidebarCollapsed && "pl-4",
        isChatCollapsed && "pr-4"
      )}>
        {viewMode === 'graph' ? (
          <KnowledgeGraph 
            onNodeSelect={handleNodeSelect} 
            selectedNodeId={selectedNode?.id} 
          />
        ) : (
          selectedNode && <DocumentViewer node={selectedNode} />
        )}
      </div>

      {/* Right Sidebar - Chatbot (~47%) */}
      <AnimatePresence mode="wait">
        {!isChatCollapsed ? (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '47%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="shrink-0 z-20 glass-panel border-y-0 border-r-0 relative"
          >
            <Chatbot onCollapse={() => setIsChatCollapsed(true)} />
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-4 h-full glass-panel flex items-start justify-center pt-8 z-30 border-y-0 border-r-0"
          >
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsChatCollapsed(false)}
              className="w-6 h-6 rounded-full glass-card flex items-center justify-center text-orange-500/60 hover:text-orange-500 transition-colors border-white/[0.1] shadow-[0_0_10px_rgba(200,106,42,0.2)]"
            >
              <ChevronLeft className="w-3 h-3" strokeWidth={3} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
