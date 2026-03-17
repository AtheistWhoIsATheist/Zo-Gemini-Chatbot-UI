import React, { useState, useEffect } from 'react';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { Chatbot } from './components/Chatbot';
import { IntelligenceCards } from './components/IntelligenceCards';
import { InsightPrompts } from './components/InsightPrompts';
import { LibraryBrowser as Library } from './components/LibraryBrowser';
import { SummaryFeed } from './components/SummaryFeed';
import { RevelationDigest } from './components/RevelationDigest';
import { StructuralGaps } from './components/StructuralGaps';
import { SystemTopology } from './components/SystemTopology';
import { KnowledgeCurator } from './components/KnowledgeCurator';
import { ShiftingVoidExplanation } from './components/ShiftingVoidExplanation';
import { corpusNodes, corpusLinks, Node } from './data/corpus';
import { 
  Menu, X, Database, Network, Library as LibraryIcon, 
  Sparkles, Eye, AlertTriangle, Cpu, MessageSquare, Layers, Zap, BookOpen
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type ViewMode = 'graph' | 'library' | 'summaries' | 'revelation' | 'gaps' | 'topology' | 'curator' | 'shifting_void';
type SidebarMode = 'chat' | 'intelligence' | 'insights';

function App() {
  const [nodes, setNodes] = useState<Node[]>(corpusNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('chat');
  const [isDbPanelOpen, setIsDbPanelOpen] = useState(false);
  const [showRupture, setShowRupture] = useState(true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowRupture(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleNodeSelect = (node: Node) => {
    setSelectedNodeId(node.id);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-100 overflow-hidden font-sans selection:bg-orange-500/30">
      
      {/* Rupture Sequence */}
      <AnimatePresence>
        {showRupture && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="text-center space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-serif tracking-widest text-white/90 uppercase">
                The Void-Graph Protocol
              </h1>
              <p className="text-zinc-500 tracking-[0.3em] uppercase text-sm">
                Professor Nihil & the Nihiltheistic Ontology
              </p>
              <motion.div 
                animate={{ scaleX: [0, 1] }} 
                transition={{ duration: 1.5, delay: 1, ease: "circOut" }}
                className="h-[1px] w-full bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Left Sidebar Button (when closed) */}
      <AnimatePresence>
        {!isLeftSidebarOpen && (
          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            onClick={() => setIsLeftSidebarOpen(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-30 w-8 h-16 bg-[#0f0f0f] border border-l-0 border-white/10 rounded-r-xl flex items-center justify-center text-zinc-500 hover:text-orange-500 transition-colors shadow-2xl"
          >
            <Menu className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Left Sidebar - Navigation & Tools */}
      <AnimatePresence>
        {isLeftSidebarOpen && (
          <motion.div 
            initial={{ x: -80 }}
            animate={{ x: 0 }}
            exit={{ x: -80 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-20 border-r border-white/5 bg-[#0f0f0f] flex flex-col items-center py-6 z-20 shadow-2xl relative"
          >
            <button 
              onClick={() => setIsLeftSidebarOpen(false)}
              className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
              <span className="font-serif italic text-orange-500 font-bold">V</span>
            </div>
            
            <nav className="flex-1 flex flex-col gap-4">
          <button 
            onClick={() => setViewMode('graph')}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
              viewMode === 'graph' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
            )}
            title="[M2] FocusMatrix (Knowledge Graph)"
          >
            <Network className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setViewMode('library')}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
              viewMode === 'library' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
            )}
            title="[M1] DataHub (Library Browser)"
          >
            <LibraryIcon className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setViewMode('summaries')}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
              viewMode === 'summaries' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
            )}
            title="[M4] AutoNarrative (Summary Feed)"
          >
            <Sparkles className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setViewMode('revelation')}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
              viewMode === 'revelation' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
            )}
            title="[M4] AutoNarrative (The Shifting Void)"
          >
            <Eye className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setViewMode('gaps')}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
              viewMode === 'gaps' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
            )}
            title="[M3] GapSynth (Structural Gap Analysis)"
          >
            <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setViewMode('topology')}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
              viewMode === 'topology' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
            )}
            title="[Ω] System Topology"
          >
            <Cpu className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setViewMode('curator')}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
              viewMode === 'curator' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
            )}
            title="[NT] Knowledge Curator"
          >
            <Zap className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setViewMode('shifting_void')}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
              viewMode === 'shifting_void' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
            )}
            title="[SV] The Shifting Void Concept"
          >
            <BookOpen className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setIsDbPanelOpen(true)}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative",
              isDbPanelOpen ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300 hover:text-orange-400"
            )}
            title="[M1] DataHub (Corpus Database Active)"
          >
            <Database className="w-5 h-5" strokeWidth={1.5} />
            {/* Active indicator dot */}
            <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
          </button>
        </nav>
      </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {viewMode === 'graph' && (
          <KnowledgeGraph 
            nodes={nodes} 
            onNodeSelect={handleNodeSelect} 
            selectedNodeId={selectedNodeId} 
          />
        )}
        {viewMode === 'library' && (
          <Library nodes={nodes} onNodeSelect={handleNodeSelect} addNode={(node) => setNodes([...nodes, node])} />
        )}
        {viewMode === 'summaries' && (
          <SummaryFeed nodes={nodes} onNodeSelect={handleNodeSelect} />
        )}
        {viewMode === 'revelation' && (
          <RevelationDigest />
        )}
        {viewMode === 'gaps' && (
          <StructuralGaps nodes={nodes} onNodeSelect={handleNodeSelect} />
        )}
        {viewMode === 'topology' && (
          <SystemTopology />
        )}
        {viewMode === 'curator' && (
          <KnowledgeCurator />
        )}
        {viewMode === 'shifting_void' && (
          <ShiftingVoidExplanation />
        )}
      </main>

      {/* Toggle Right Sidebar Button (when closed) */}
      <AnimatePresence>
        {!isRightSidebarOpen && (
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            onClick={() => setIsRightSidebarOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-30 w-8 h-16 bg-[#0f0f0f] border border-r-0 border-white/10 rounded-l-xl flex items-center justify-center text-zinc-500 hover:text-orange-500 transition-colors shadow-2xl"
          >
            <Menu className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Right Sidebar - Professor Nihil & Intelligence Cards */}
      <AnimatePresence>
        {isRightSidebarOpen && (
          <motion.div 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[400px] border-l border-white/5 bg-[#0f0f0f] flex flex-col z-20 shadow-2xl relative"
          >
            <button 
              onClick={() => setIsRightSidebarOpen(false)}
              className="absolute top-2 left-2 p-1 text-zinc-500 hover:text-white transition-colors z-50"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Sidebar Mode Toggle */}
        <div className="absolute -left-12 top-20 flex flex-col gap-2 z-50">
          <button
            onClick={() => setSidebarMode('chat')}
            className={cn(
              "w-10 h-10 rounded-l-xl flex items-center justify-center transition-all border border-r-0 border-white/10",
              sidebarMode === 'chat' ? "bg-[#0f0f0f] text-orange-500" : "bg-black/60 text-zinc-500 hover:text-zinc-300"
            )}
            title="Professor Nihil"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSidebarMode('intelligence')}
            className={cn(
              "w-10 h-10 rounded-l-xl flex items-center justify-center transition-all border border-r-0 border-white/10",
              sidebarMode === 'intelligence' ? "bg-[#0f0f0f] text-fuchsia-500" : "bg-black/60 text-zinc-500 hover:text-zinc-300"
            )}
            title="Intelligence Cards"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSidebarMode('insights')}
            className={cn(
              "w-10 h-10 rounded-l-xl flex items-center justify-center transition-all border border-r-0 border-white/10",
              sidebarMode === 'insights' ? "bg-[#0f0f0f] text-emerald-500" : "bg-black/60 text-zinc-500 hover:text-zinc-300"
            )}
            title="Insight Prompts"
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>

        {sidebarMode === 'chat' ? (
          <Chatbot 
            nodes={nodes}
            onCollapse={() => {}}
          />
        ) : sidebarMode === 'intelligence' ? (
          <IntelligenceCards 
            nodes={nodes}
            links={corpusLinks}
            onNodeSelect={handleNodeSelect}
          />
        ) : (
          <InsightPrompts 
            nodes={nodes}
            links={corpusLinks}
            onNodeSelect={handleNodeSelect}
          />
        )}
      </motion.div>
        )}
      </AnimatePresence>

      {/* Database Panel Overlay */}
      <AnimatePresence>
        {isDbPanelOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDbPanelOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-20 h-full w-[400px] bg-[#0f0f0f] border-r border-white/10 z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-medium tracking-wide">Abyssal Archive</h2>
                </div>
                <button 
                  onClick={() => setIsDbPanelOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="space-y-6">
                  <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">System Status</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Total Nodes</span>
                      <span className="text-orange-400 font-mono">{nodes.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-zinc-400">Sync State</span>
                      <span className="text-emerald-400 text-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        LOCAL_FIRST
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Raw Node Data</h3>
                    <div className="space-y-2">
                      {nodes.map(node => (
                        <div key={node.id} className="p-3 bg-black/40 border border-white/5 rounded-lg hover:border-white/10 transition-colors cursor-pointer" onClick={() => {
                          handleNodeSelect(node);
                          setIsDbPanelOpen(false);
                          setViewMode('graph');
                        }}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-medium text-zinc-300 truncate pr-2">{node.label}</span>
                            <span className="text-[9px] uppercase tracking-wider text-zinc-600 border border-white/5 px-1.5 py-0.5 rounded">{node.type}</span>
                          </div>
                          <div className="text-[10px] text-zinc-600 font-mono truncate">ID: {node.id}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
