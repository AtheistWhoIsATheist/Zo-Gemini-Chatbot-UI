/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { DocumentViewer } from './components/DocumentViewer';
import { Chatbot } from './components/Chatbot';
import { Node } from './data/corpus';
import { Network, FileText, Database } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'document'>('graph');

  const handleNodeSelect = (node: Node) => {
    setSelectedNode(node);
    if (node.content) {
      setViewMode('document');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] text-zinc-300 overflow-hidden selection:bg-orange-500/30">
      
      {/* Left Sidebar - Navigation / Controls */}
      <div className="w-16 flex flex-col items-center py-6 border-r border-zinc-800 bg-[#0a0a0a] z-20">
        <div className="w-8 h-8 rounded bg-zinc-100 text-black flex items-center justify-center font-bold font-mono text-xs mb-8">
          N
        </div>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => setViewMode('graph')}
            className={cn(
              "p-3 rounded-xl transition-all cursor-pointer",
              viewMode === 'graph' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
            )}
            title="Knowledge Graph"
          >
            <Network className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              if (selectedNode?.content) setViewMode('document');
            }}
            className={cn(
              "p-3 rounded-xl transition-all cursor-pointer",
              viewMode === 'document' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900",
              !selectedNode?.content && "opacity-50 cursor-not-allowed"
            )}
            title="Document Viewer"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-auto p-3 text-zinc-600" title="Corpus Database Active">
          <Database className="w-5 h-5" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {viewMode === 'graph' ? (
          <KnowledgeGraph 
            onNodeSelect={handleNodeSelect} 
            selectedNodeId={selectedNode?.id} 
          />
        ) : (
          selectedNode && <DocumentViewer node={selectedNode} />
        )}
      </div>

      {/* Right Sidebar - Chatbot */}
      <div className="w-[400px] shrink-0 z-20 shadow-2xl">
        <Chatbot />
      </div>

    </div>
  );
}
