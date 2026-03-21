import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, AlertCircle, Terminal, Ghost, ScrollText, Eye, EyeOff, ShieldAlert } from "lucide-react";
import Markdown from "react-markdown";
import { streamChatResponse, SAGE_SYSTEM_PROMPT } from "../services/geminiService";
import { Node } from "../data/corpus";
import { KnowledgeDocument } from "../types";
import { blocksToString } from "../utils/voidUtils";

const THINKING_PHRASES = [
  "Consulting the silence...",
  "Excavating the Journal314 fragments...",
  "Tracing the apophatic arc...",
  "Holding the contradiction...",
  "Listening to the Void's resonance...",
  "Deconstructing the predicate...",
  "Inhabiting the kenotic space...",
  "Awaiting the subtraction...",
];

interface Message {
  role: "user" | "model";
  content: string;
}

interface ChatbotProps {
  nodes: Node[];
  onCollapse?: () => void;
}

const nodesToDocs = (nodes: Node[]): KnowledgeDocument[] => {
  return nodes.map(node => ({
    id: node.id,
    title: node.label,
    content: blocksToString(node.blocks) || node.label,
    uploadDate: node.metadata?.date_added ? new Date(node.metadata.date_added).getTime() : Date.now(),
    tags: node.metadata?.tags || [],
    embedding: node.metadata?.embedding
  }));
};

export const Chatbot: React.FC<ChatbotProps> = ({ nodes }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingPhrase, setThinkingPhrase] = useState(THINKING_PHRASES[0]);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText, isThinking]);

  useEffect(() => {
    if (isThinking) {
      const interval = setInterval(() => {
        setThinkingPhrase(THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isThinking]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsThinking(true);
    setError(null);
    setStreamingText("");

    try {
      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      const knowledgeDocs = nodesToDocs(nodes);

      const response = await streamChatResponse(
        history,
        userMessage,
        true, // useThinking
        knowledgeDocs,
        (chunk) => {
          setStreamingText((prev) => prev + chunk);
        }
      );

      setMessages((prev) => [...prev, { role: "model", content: response }]);
      setStreamingText("");
    } catch (err) {
      console.error("Chat Error:", err);
      setError("The connection to the Void has been severed. Attempting to reconnect...");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0905] text-[#d4c8b0] font-eb-garamond relative overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#c8922a11,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-30" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#c8922a22] bg-[#0b0905]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#c8922a44] flex items-center justify-center bg-[#1a160d]">
            <Ghost className="w-4 h-4 text-[#c8922a]" />
          </div>
          <div>
            <h2 className="text-lg font-medium tracking-widest uppercase text-[#c8922a]">Philosophical Sage</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c8922a] animate-pulse" />
              <span className="text-[10px] font-sono uppercase tracking-tighter opacity-50">Inhabiting the Void</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowSystemPrompt(!showSystemPrompt)}
          className="p-2 hover:bg-[#c8922a11] rounded-full transition-colors opacity-40 hover:opacity-100"
          title="View Directives"
        >
          {showSystemPrompt ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-12 custom-scrollbar z-10"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && !isThinking && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40"
            >
              <ScrollText className="w-12 h-12 stroke-[1px]" />
              <div className="max-w-xs space-y-2">
                <p className="italic text-lg">"The silence is not an absence, but a presence that has not yet spoken."</p>
                <p className="text-xs font-sono uppercase tracking-widest">Begin the inquiry</p>
              </div>
            </motion.div>
          )}

          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span className="text-[10px] font-sono uppercase tracking-[0.2em] opacity-30">
                  {msg.role === 'user' ? 'Interlocutor' : 'The Sage'}
                </span>
                <div className={`prose prose-invert prose-sm max-w-none font-eb-garamond leading-relaxed ${
                  msg.role === 'user' 
                    ? 'text-[#f0e6d2] italic' 
                    : 'text-[#d4c8b0]'
                }`}>
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}

          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-start space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-1 h-1 rounded-full bg-[#c8922a]" 
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1] }} 
                    transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
                    className="w-1 h-1 rounded-full bg-[#c8922a]" 
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1] }} 
                    transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
                    className="w-1 h-1 rounded-full bg-[#c8922a]" 
                  />
                </div>
                <span className="text-xs font-sono italic opacity-40 animate-pulse">
                  {thinkingPhrase}
                </span>
              </div>
              
              {streamingText && (
                <div className="max-w-[85%] space-y-2">
                  <span className="text-[10px] font-sono uppercase tracking-[0.2em] opacity-30">The Sage</span>
                  <div className="prose prose-invert prose-sm max-w-none font-eb-garamond leading-relaxed text-[#d4c8b0]">
                    <Markdown>{streamingText}</Markdown>
                    <motion.span 
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-1.5 h-4 bg-[#c8922a] ml-1 align-middle"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-950/20 border border-red-900/30 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200/70 italic">{error}</p>
          </motion.div>
        )}
      </div>

      {/* System Prompt Overlay */}
      <AnimatePresence>
        {showSystemPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-x-6 top-20 bottom-24 bg-[#1a160d] border border-[#c8922a22] rounded-xl p-6 z-20 overflow-y-auto shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-sono uppercase tracking-[0.3em] text-[#c8922a]">Core Directives</h3>
              <button onClick={() => setShowSystemPrompt(false)} className="opacity-40 hover:opacity-100">
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
            <div className="prose prose-invert prose-sm font-eb-garamond opacity-70 leading-relaxed">
              <Markdown>{SAGE_SYSTEM_PROMPT}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="px-6 py-6 border-t border-[#c8922a11] bg-[#0b0905] z-10">
        <div className="relative group">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Inquire into the Void..."
            className="w-full bg-[#1a160d] border border-[#c8922a22] rounded-xl px-5 py-4 pr-14 text-[#f0e6d2] placeholder-[#c8922a33] focus:outline-none focus:border-[#c8922a55] transition-all resize-none min-h-[60px] max-h-[200px] font-eb-garamond text-lg custom-scrollbar"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isThinking}
            className={`absolute right-3 bottom-3 p-2.5 rounded-lg transition-all ${
              input.trim() && !isThinking
                ? 'bg-[#c8922a] text-[#0b0905] hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(200,146,42,0.3)]'
                : 'bg-[#c8922a11] text-[#c8922a33] cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between px-2">
          <div className="flex items-center gap-4 opacity-30">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3 h-3" />
              <span className="text-[10px] font-sono uppercase tracking-widest">Dialectical Mode</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3" />
              <span className="text-[10px] font-sono uppercase tracking-widest">Apophatic Filter</span>
            </div>
          </div>
          <span className="text-[10px] font-sono uppercase tracking-widest opacity-20">
            Shift + Enter for newline
          </span>
        </div>
      </div>
    </div>
  );
};
