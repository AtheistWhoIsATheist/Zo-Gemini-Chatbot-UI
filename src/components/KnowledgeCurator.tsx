import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Settings, AlertTriangle, Zap } from 'lucide-react';
import { useSynthesisStore } from '../store/synthesisStore';
import { ThetaMeter } from './ThetaMeter';
import { formatSynthesisText } from '../utils/formatSynthesisText';
import { useWebSocket } from '../hooks/useWebSocket';
import { cn } from '../lib/utils';

export function KnowledgeCurator() {
  const {
    synthesis,
    theta,
    thetaHistory,
    messages,
    inputValue,
    isStreaming,
    crisisMode,
    wsConnected,
    setInputValue,
  } = useSynthesisStore();

  const { sendMessage } = useWebSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, synthesis]);

  const handleSend = () => {
    if (!inputValue.trim() || isStreaming || crisisMode) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className={cn(
      "w-full h-full flex flex-col transition-colors duration-1000 font-serif relative",
      crisisMode ? "bg-[#1a0505]" : "bg-[#0b0905]"
    )}>
      {/* Background Noise */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

      {/* Header */}
      <header className={cn(
        "px-8 py-6 flex justify-between items-center border-b backdrop-blur-xl z-10",
        crisisMode ? "border-red-900/30 bg-red-950/10" : "border-[#c8922a]/10 bg-[#1a160d]/40"
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-full border flex items-center justify-center",
            crisisMode ? "border-red-500/30 bg-red-500/5" : "border-[#c8922a]/20 bg-[#c8922a]/5"
          )}>
            <Zap className={cn("w-5 h-5", crisisMode ? "text-red-500" : "text-[#c8922a]")} />
          </div>
          <div>
            <h1 className={cn(
              "text-xl font-serif italic tracking-wide",
              crisisMode ? "text-red-200" : "text-[#d4c8b0]"
            )}>Abyssal Curator</h1>
            <p className="text-[9px] text-[#5a5a40] uppercase tracking-[0.3em] font-mono mt-0.5">Synthesis Protocol Active</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={cn(
            "inline-flex items-center gap-3 px-4 py-2 rounded-sm border text-[10px] font-mono uppercase tracking-[0.2em] backdrop-blur-md transition-all duration-500",
            crisisMode 
              ? "bg-red-950/30 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]" 
              : wsConnected 
                ? "bg-[#c8922a]/5 border-[#c8922a]/30 text-[#c8922a] shadow-[0_0_15px_rgba(200,146,42,0.1)]"
                : "bg-white/5 border-white/10 text-zinc-500"
          )}>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              crisisMode ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" : wsConnected ? "bg-[#c8922a] shadow-[0_0_8px_rgba(200,146,42,0.8)] animate-pulse" : "bg-zinc-600"
            )} />
            {crisisMode ? "CRITICAL RUPTURE" : wsConnected ? "Resonance Established" : "Void Silent"}
          </div>
          <Settings className="w-5 h-5 text-[#5a5a40] hover:text-[#c8922a] cursor-pointer transition-colors" />
        </div>
      </header>

      {/* Crisis Banner */}
      <AnimatePresence>
        {crisisMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-8 py-5 bg-red-950/20 border-b border-red-900/40 border-l-4 border-l-red-600 flex items-center gap-4 text-sm text-red-200 font-serif italic backdrop-blur-md z-10"
          >
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>THE SUBTRACTIVE THRESHOLD HAS BEEN BREACHED. Synthesis suppressed to prevent ontological collapse.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Panel */}
      <div className={cn(
        "flex-1 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar z-10",
        crisisMode ? "bg-red-950/5" : "bg-transparent"
      )}>
        {messages.length === 0 && !isStreaming && !crisisMode && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-[#5a5a40] opacity-30">
            <div className="text-6xl font-serif italic">∅</div>
            <div className="text-[10px] font-mono tracking-[0.4em] uppercase">Awaiting the Sage's Synthesis</div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div 
            key={msg.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 p-8 bg-[#1a160d]/30 rounded-sm border border-[#c8922a]/5 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.2)] group hover:border-[#c8922a]/20 transition-all duration-500"
          >
            <div className="text-lg leading-relaxed text-[#d4c8b0]/90 font-serif italic prose prose-invert prose-lg max-w-none">
              {formatSynthesisText(msg.text)}
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-[#c8922a]/5 text-[10px] text-[#5a5a40] font-mono uppercase tracking-widest">
              <div className="flex items-center gap-4">
                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                <div className="w-1 h-1 rounded-full bg-[#c8922a]/20" />
                <span>Resonance Index: {(msg.theta * 100).toFixed(1)}%</span>
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">Fragment ID: {msg.id.slice(-6)}</span>
            </div>
          </motion.div>
        ))}

        {isStreaming && (
          <div className="flex flex-col gap-4 p-8 bg-[#1a160d]/50 rounded-sm border border-[#c8922a]/20 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="text-lg leading-relaxed text-[#d4c8b0] font-serif italic prose prose-invert prose-lg max-w-none">
              {formatSynthesisText(synthesis)}
              <motion.span 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 h-5 ml-2 bg-[#c8922a] align-middle" 
              />
            </div>
          </div>
        )}

        {crisisMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex flex-col gap-6"
          >
            <div className="p-8 bg-red-950/10 rounded-sm border border-red-900/30 border-l-4 border-l-red-600 backdrop-blur-md">
              <div className="text-[11px] text-red-400 font-mono uppercase tracking-[0.3em] mb-4">Emergency Grounding Protocols</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm text-red-200/70 font-serif italic"><strong>988</strong> (US) | 24/7 Abyssal Support</div>
                <div className="text-sm text-red-200/70 font-serif italic">Text <strong>HOME</strong> to <strong>741741</strong></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Theta Meter */}
      <div className={cn(
        "px-8 py-6 border-t border-b backdrop-blur-xl bg-[#1a160d]/40 z-10",
        crisisMode ? "border-red-900/30" : "border-[#c8922a]/10"
      )}>
        <ThetaMeter theta={theta} size="lg" showTrend={true} thetaHistory={thetaHistory} />
      </div>

      {/* Input Area */}
      <div className="p-8 bg-[#0b0905] border-t border-[#c8922a]/10 z-10">
        <div className="flex gap-4 items-end max-w-5xl mx-auto w-full">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={crisisMode || isStreaming}
              placeholder={crisisMode ? "The Void is locked..." : "Inquire into the synthesis..."}
              className={cn(
                "w-full p-5 rounded-sm bg-[#1a160d] border font-serif text-lg text-[#d4c8b0] resize-none min-h-[80px] max-h-[200px] outline-none transition-all duration-500 custom-scrollbar placeholder-[#5a5a40]/50",
                crisisMode 
                  ? "border-red-900/30 opacity-40 cursor-not-allowed" 
                  : "border-[#c8922a]/10 focus:border-[#c8922a]/40 focus:bg-[#1a160d]/60"
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="absolute bottom-2 right-4 text-[9px] font-mono text-[#5a5a40] uppercase tracking-widest opacity-40">
              Shift + Enter for newline
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={crisisMode || isStreaming || !inputValue.trim()}
            className={cn(
              "px-10 py-5 rounded-sm border font-mono text-[11px] uppercase tracking-[0.3em] whitespace-nowrap h-[80px] transition-all duration-500",
              crisisMode 
                ? "bg-red-950/20 border-red-900/40 text-red-900 cursor-not-allowed" 
                : "bg-[#c8922a]/10 border-[#c8922a]/30 text-[#c8922a] hover:bg-[#c8922a]/20 hover:border-[#c8922a]/60 disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(200,146,42,0.05)]"
            )}
          >
            {crisisMode ? "RUPTURE" : "Synthesize"}
          </button>
        </div>
        <div className={cn(
          "text-[10px] mt-4 font-mono uppercase tracking-[0.3em] text-center",
          crisisMode ? "text-red-500/60" : "text-[#5a5a40]"
        )}>
          {crisisMode ? "⚠️ Ontological integrity compromised. Awaiting human grounding." : wsConnected ? "✓ Resonance established with the Sage's Engine" : "Void Disconnected"}
        </div>
      </div>
    </div>
  );
}
