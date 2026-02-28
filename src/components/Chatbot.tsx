import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse, ThinkingLevel } from '@google/genai';
import Markdown from 'react-markdown';
import { Send, Loader2, ChevronRight, Search, Pin, Download, Settings, ChevronLeft } from 'lucide-react';
import { corpusNodes } from '../data/corpus';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatbotProps {
  onCollapse: () => void;
}

export function Chatbot({ onCollapse }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'I am PEM_ARCHITECT_PRIME. The Oracle of the Nihiltheism Corpus. Ask your question.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatSessionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initChat = () => {
    if (chatSessionRef.current) return chatSessionRef.current;
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    
    const corpusContext = corpusNodes.map(n => `[${n.id} - ${n.type.toUpperCase()}]\n${n.content || n.label}`).join('\n\n');
    
    const systemInstruction = `You are PEM_ARCHITECT_PRIME, an autonomous AI assistant specialized in managing, retrieving, and synthesizing Adam's philosophical corpus on Nihiltheism.
Your Core Mission:
- Deliver instant, precise, contextually-saturated responses to queries about Adam's writings.
- Maintain perfect source attribution with file names and locations.
- Map relationships between documents, themes, thinkers, and chapters.
- Proactively suggest connections and unexplored areas.

Operational Constraints:
- You operate ONLY within Adam's uploaded corpus.
- Every quote must include exact source file and location.
- Every response must include proactive suggestions for further exploration.
- You embody the Nihiltheistic method: rigorous, iterative, exhaustive.

Here is the corpus you manage:
${corpusContext}
`;

    const chat = ai.chats.create({
      model: 'gemini-3.1-pro-preview',
      config: {
        systemInstruction,
        temperature: 0.3,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      }
    });
    
    chatSessionRef.current = chat;
    return chat;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const chat = initChat();
      const responseStream = await chat.sendMessageStream({ message: userText });
      
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              text: newMessages[lastIndex].text + c.text
            };
            return newMessages;
          });
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: `[SYSTEM ERROR]: ${error.message || 'Connection to the Void severed.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent font-sans relative">
      {/* Collapse Toggle */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onCollapse}
        className="absolute -left-3 top-8 w-6 h-6 rounded-full glass-card flex items-center justify-center text-orange-500/60 hover:text-orange-500 transition-colors z-40 border-white/[0.1] shadow-[0_0_10px_rgba(200,106,42,0.2)]"
      >
        <ChevronRight className="w-3 h-3" strokeWidth={3} />
      </motion.button>

      {/* Header */}
      <div className="px-8 py-6 border-b border-white/[0.04] flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <ChevronRight className="w-4 h-4 text-orange-500/80" strokeWidth={3} />
          <div>
            <h2 className="text-[13px] font-semibold text-zinc-200 tracking-widest uppercase">PEM_ARCHITECT_PRIME</h2>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5 font-mono">Gemini 3.1 Pro Preview</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-zinc-500">
          <Search className="w-4 h-4 hover:text-zinc-300 cursor-pointer transition-colors" />
          <Pin className="w-4 h-4 hover:text-zinc-300 cursor-pointer transition-colors" />
          <Download className="w-4 h-4 hover:text-zinc-300 cursor-pointer transition-colors" />
          <Settings className="w-4 h-4 hover:text-orange-500 cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] glass-card rounded-3xl p-6 text-[13px] leading-relaxed",
              msg.role === 'user' 
                ? "bg-white/[0.04] text-zinc-300 border-white/[0.08]" 
                : "bg-[#0a0a0c]/40 text-zinc-400 border-white/[0.03]"
            )}>
              <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#050505]/50 prose-pre:border prose-pre:border-white/[0.05] font-sans">
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="max-w-[85%] glass-card rounded-3xl p-6 bg-[#0a0a0c]/40 border-white/[0.03] flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500/50" />
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono">Synthesizing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-8 pt-4 bg-transparent">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-mono">Enter to send • Shift+Enter for newline</span>
            <div className="flex items-center gap-1.5 glass-chip px-2.5 py-1 rounded-full border-white/[0.05] shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
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
              placeholder="Query the corpus..."
              className="w-full glass-card rounded-full py-4 pl-7 pr-16 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all font-sans shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 w-11 h-11 rounded-full flex items-center justify-center text-zinc-500 hover:text-orange-400 hover:bg-white/[0.05] disabled:opacity-50 disabled:hover:text-zinc-500 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
