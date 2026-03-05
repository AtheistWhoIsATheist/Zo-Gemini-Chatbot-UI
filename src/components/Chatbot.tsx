/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Send, Loader2, ChevronRight, Search, Pin, Download, Settings, AlertTriangle } from 'lucide-react';
import { Node } from '../data/corpus';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { streamChatResponse } from '../services/geminiService';
import { KnowledgeDocument } from '../types';
import { blocksToString } from '../utils/voidUtils';

interface Message {
  role: 'user' | 'model' | 'system';
  text: string;
}

interface ChatbotProps {
  nodes: Node[];
  onCollapse: () => void;
}

export function Chatbot({ nodes, onCollapse }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'I am the Knowledge Curator. I synthesize the Void into structured wisdom. How shall we deconstruct the library today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatSessionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);
    setError(null);

    try {
      const history = messages.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));
      

      const knowledgeDocs = nodes.map(n => ({
        id: n.id,
        title: n.label,
        content: blocksToString(n.blocks) || n.label,
        uploadDate: n.metadata?.date_added ? new Date(n.metadata.date_added).getTime() : 0,
        tags: n.metadata?.tags || [],
        embedding: n.metadata?.embedding
      }));

      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      await streamChatResponse(
        history,
        userText,
        true,
        knowledgeDocs,
        (chunk) => {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              text: newMessages[lastIndex].text + chunk
            };
            return newMessages;
          });
        }
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg = `[SYSTEM ERROR]: ${err.message || 'Connection to the Void severed.'}`;
      setError(errorMsg);
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full neo-bg font-sans relative">
      {/* Collapse Toggle */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCollapse}
        className="absolute -left-3 top-8 w-6 h-6 rounded-full neo-convex flex items-center justify-center text-orange-500/60 hover:text-orange-500 transition-colors z-40"
      >
        <ChevronRight className="w-3 h-3" strokeWidth={3} />
      </motion.button>

      {/* Header */}
      <div className="px-8 py-6 border-b border-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChevronRight className="w-4 h-4 text-orange-500/80" strokeWidth={3} />
          <div>
            <h2 className="text-[13px] font-semibold text-zinc-200 tracking-widest uppercase">PEM_ARCHITECT_PRIME</h2>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5 font-mono">Existential Engine Active</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-zinc-500">
          <Search className="w-4 h-4 hover:text-zinc-300 cursor-pointer transition-colors" />
          <Pin className="w-4 h-4 hover:text-zinc-300 cursor-pointer transition-colors" />
          <Download className="w-4 h-4 hover:text-zinc-300 cursor-pointer transition-colors" />
          <Settings className="w-4 h-4 hover:text-orange-500 cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500/10 border-b border-red-500/20 px-8 py-3 flex items-center gap-3"
          >
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-[10px] text-red-400 font-mono uppercase tracking-widest">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] rounded-3xl p-6 text-[13px] leading-relaxed",
              msg.role === 'user' 
                ? "neo-convex text-zinc-300" 
                : "neo-flat text-zinc-400"
            )}>
              <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#111] prose-pre:border prose-pre:border-white/[0.02] font-sans">
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="max-w-[85%] neo-flat rounded-3xl p-6 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500/50" />
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono">Deconstructing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-8 pt-4 neo-bg">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-mono">Enter to send • Shift+Enter for newline</span>
            <div className="flex items-center gap-1.5 neo-flat-sm px-2.5 py-1 rounded-full">
              <div className="w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.5)]"></div>
              <span className="text-[8px] uppercase tracking-widest text-zinc-400 font-mono">Context: Nihiltheism Corpus</span>
            </div>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Query the void..."
              className="w-full neo-pressed rounded-full py-4 pl-7 pr-16 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all font-sans"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 w-11 h-11 rounded-full flex items-center justify-center neo-convex text-zinc-500 hover:text-orange-400 disabled:opacity-50 disabled:hover:text-zinc-500 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
