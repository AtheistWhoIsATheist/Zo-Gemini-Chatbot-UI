import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Settings, AlertTriangle } from 'lucide-react';
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
      "w-full h-full flex flex-col transition-colors duration-500 font-serif",
      crisisMode ? "bg-[linear-gradient(135deg,rgba(80,15,15,0.3)_0%,rgba(30,5,5,0.4)_100%),#030303] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.8),inset_0_0_40px_rgba(80,15,15,0.2)]" : "bg-[#030303]"
    )}>
      {/* Header */}
      <header className={cn(
        "px-6 py-4 flex justify-between items-center border-b backdrop-blur-[20px] saturate-[180%] bg-[rgba(255,255,255,0.03)]",
        crisisMode ? "border-[rgba(80,15,15,0.3)]" : "border-[rgba(255,255,255,0.06)]"
      )}>
        <h1 className="text-lg font-normal text-[#b0b8c1] tracking-wider">Knowledge Curator</h1>
        <div className="flex items-center gap-4">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded border text-[11px] font-semibold uppercase tracking-wider backdrop-blur-[10px]",
            crisisMode 
              ? "bg-[rgba(80,15,15,0.2)] border-[rgba(80,15,15,0.4)] text-[rgba(200,100,100,0.9)]" 
              : wsConnected 
                ? "bg-[rgba(74,111,74,0.1)] border-[rgba(74,111,74,0.3)] text-[rgba(111,160,111,0.9)]"
                : "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#8a9099]"
          )}>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              crisisMode ? "bg-[rgba(150,30,30,0.9)] shadow-[0_0_8px_rgba(150,30,30,0.8)] animate-pulse" : wsConnected ? "bg-[rgba(74,111,74,0.9)] shadow-[0_0_8px_rgba(74,111,74,0.8)] animate-pulse" : "bg-[#8a9099]"
            )} />
            {crisisMode ? "CRISIS" : wsConnected ? "Connected" : "Disconnected"}
          </div>
          <Settings className="w-5 h-5 text-[#8a9099] hover:text-[#b0b8c1] cursor-pointer transition-colors" />
        </div>
      </header>

      {/* Crisis Banner */}
      <AnimatePresence>
        {crisisMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-4 bg-[rgba(80,15,15,0.2)] border-b border-[rgba(80,15,15,0.4)] border-l-4 border-l-[rgba(150,30,30,0.6)] flex items-center gap-3 text-[13px] text-[rgba(200,100,100,0.95)] font-medium backdrop-blur-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.02),inset_0_-2px_8px_rgba(80,15,15,0.3)]"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>CRISIS MODE ACTIVE: Synthesis safety threshold exceeded. Awaiting resolution.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Panel */}
      <div className={cn(
        "flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar",
        crisisMode ? "bg-[rgba(20,5,5,0.3)] border-l-2 border-[rgba(80,15,15,0.4)]" : "bg-[#0a0a0a]"
      )}>
        {messages.length === 0 && !isStreaming && !crisisMode && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#8a9099] opacity-50">
            <div className="text-4xl font-serif italic">∅</div>
            <div className="text-sm font-sans tracking-widest uppercase">Awaiting synthesis...</div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-2 p-4 bg-[rgba(255,255,255,0.03)] rounded border border-[rgba(255,255,255,0.06)] backdrop-blur-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_4px_16px_rgba(0,0,0,0.6)]">
            <div className="text-sm leading-relaxed text-[#b0b8c1]">
              {formatSynthesisText(msg.text)}
            </div>
            <div className="flex justify-between items-center text-[11px] text-[#8a9099] font-mono">
              <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              <span>θ = {msg.theta.toFixed(2)}</span>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex flex-col gap-2 p-4 bg-[rgba(255,255,255,0.03)] rounded border border-[rgba(255,255,255,0.06)] backdrop-blur-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_4px_16px_rgba(0,0,0,0.6)]">
            <div className="text-sm leading-relaxed text-[#b0b8c1]">
              {formatSynthesisText(synthesis)}
              <span className="inline-block w-1.5 h-4 ml-1 bg-[#8a9099] animate-pulse align-middle" />
            </div>
          </div>
        )}

        {crisisMode && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="p-4 bg-[rgba(255,255,255,0.03)] rounded border-l-2 border-[rgba(150,30,30,0.5)] backdrop-blur-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_4px_16px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(80,15,15,0.2)]">
              <div className="text-[13px] text-[rgba(200,100,100,0.95)] font-medium uppercase tracking-wider mb-2">Crisis Resources Available</div>
              <div className="flex flex-col gap-2">
                <div className="text-sm text-[#b0b8c1] font-mono"><strong>988</strong> (US) | 24/7 Free Confidential Support</div>
                <div className="text-sm text-[#b0b8c1] font-mono">Text <strong>HOME</strong> to <strong>741741</strong></div>
                <div className="text-sm text-[#b0b8c1] font-mono"><strong>911</strong> (US) | Immediate Life-Threatening Situations</div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Theta Meter */}
      <div className={cn(
        "px-6 py-4 border-t border-b backdrop-blur-[10px] bg-[rgba(255,255,255,0.03)]",
        crisisMode ? "border-[rgba(80,15,15,0.3)]" : "border-[rgba(255,255,255,0.06)]"
      )}>
        <ThetaMeter theta={theta} size="lg" showTrend={true} thetaHistory={thetaHistory} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-[rgba(255,255,255,0.03)] backdrop-blur-[10px] border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex gap-3 items-end">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={crisisMode || isStreaming}
            placeholder={crisisMode ? "Input disabled during crisis mode..." : "Ask about the void, paradox, or apophatic theology..."}
            className={cn(
              "flex-1 p-3 rounded bg-[#111111] border font-serif text-sm text-[#8a9099] resize-none min-h-[60px] max-h-[120px] outline-none transition-all shadow-[inset_0_4px_8px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.02)] custom-scrollbar",
              crisisMode 
                ? "border-[rgba(80,15,15,0.3)] opacity-60 cursor-not-allowed shadow-[inset_0_4px_8px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.02),inset_0_-2px_4px_rgba(80,15,15,0.3)]" 
                : "border-[rgba(255,255,255,0.06)] focus:border-[#4a5158]"
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={crisisMode || isStreaming || !inputValue.trim()}
            className={cn(
              "px-6 py-3 rounded border font-medium text-[13px] uppercase tracking-wider whitespace-nowrap h-[60px] backdrop-blur-[10px] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.02)]",
              crisisMode 
                ? "bg-[rgba(255,255,255,0.03)] border-[rgba(80,15,15,0.3)] text-[#8a9099] opacity-50 cursor-not-allowed" 
                : "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#b0b8c1] hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {crisisMode ? "CRISIS MODE" : "Send"}
          </button>
        </div>
        <div className={cn(
          "text-[11px] mt-2 font-mono font-semibold uppercase tracking-wider",
          crisisMode ? "text-[rgba(200,100,100,0.8)]" : "text-[#8a9099]"
        )}>
          {crisisMode ? "⚠️ Synthesis suppressed. Human oversight required." : wsConnected ? "✓ Connected to synthesis engine" : "Disconnected"}
        </div>
      </div>
    </div>
  );
}
