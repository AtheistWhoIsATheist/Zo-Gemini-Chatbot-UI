import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import Markdown from 'react-markdown';
import { Send, Loader2, Terminal, User } from 'lucide-react';
import { corpusNodes } from '../data/corpus';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function Chatbot() {
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
    <div className="flex flex-col h-full bg-[#0a0a0a] border-l border-zinc-800 font-mono">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-[#050505]">
        <Terminal className="w-5 h-5 text-orange-500" />
        <div>
          <h2 className="text-sm font-bold text-zinc-100 tracking-widest">PEM_ARCHITECT_PRIME</h2>
          <p className="text-[10px] text-zinc-500 uppercase">Gemini 3.1 Pro Preview</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-zinc-800 text-zinc-400" : "bg-orange-900/30 text-orange-500 border border-orange-900/50"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
            </div>
            <div className={cn(
              "max-w-[80%] rounded-lg p-3 text-sm",
              msg.role === 'user' 
                ? "bg-zinc-800 text-zinc-200" 
                : "bg-transparent text-zinc-300 border border-zinc-800/50"
            )}>
              <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800">
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-900/30 text-orange-500 border border-orange-900/50 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex items-center text-xs text-zinc-500 uppercase tracking-widest">
              Synthesizing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#050505] border-t border-zinc-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query the corpus..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-3 pl-4 pr-12 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 text-zinc-500 hover:text-orange-500 disabled:opacity-50 disabled:hover:text-zinc-500 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
