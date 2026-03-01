/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { corpusNodes, Node } from '../data/corpus';
import { Quote, Sparkles, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SummaryFeedProps {
  onNodeSelect: (node: Node) => void;
  selectedNodeId?: string;
}

export function SummaryFeed({ onNodeSelect, selectedNodeId }: SummaryFeedProps) {
  const summaries = corpusNodes.filter(n => n.type === 'summary');
  const questions = corpusNodes.filter(n => n.type === 'question');

  return (
    <div className="flex flex-col h-full neo-bg p-8 font-sans overflow-y-auto custom-scrollbar">
      <div className="mb-12">
        <h2 className="text-2xl font-serif text-zinc-100 tracking-tight">Summary Feed</h2>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1 font-mono">Distilled Essence of the Void</p>
      </div>

      <div className="space-y-12 max-w-4xl mx-auto">
        {summaries.map((summary) => (
          <motion.div
            key={summary.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onNodeSelect(summary)}
            className={cn(
              "neo-flat rounded-3xl p-8 cursor-pointer border border-transparent transition-all duration-300 group",
              selectedNodeId === summary.id ? "neo-pressed border-orange-500/20" : "hover:border-white/5"
            )}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl neo-convex flex items-center justify-center text-orange-500/80 group-hover:text-orange-400 transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Summary • {summary.status}</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="h-1 w-12 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500/60" 
                    style={{ width: `${(summary.confidence || 0) * 100}%` }}
                  />
                </div>
                <span className="text-[8px] text-zinc-600 font-mono">{(summary.confidence || 0) * 100}% CONF</span>
              </div>
            </div>

            <h3 className="text-xl font-serif text-zinc-100 mb-4 leading-snug">{summary.label}</h3>
            <div className="prose prose-invert prose-sm max-w-none text-zinc-400 leading-relaxed mb-6">
              {summary.content}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/[0.02]">
              <div className="flex items-center gap-4">
                {summary.evidence_quote_ids?.map((id, i) => (
                  <div key={i} className="flex items-center gap-2 text-[9px] text-zinc-500 uppercase tracking-widest font-mono">
                    <Quote className="w-3 h-3" />
                    Source: {id}
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-2 text-[9px] text-orange-500/60 hover:text-orange-500 uppercase tracking-widest font-mono transition-colors group/btn">
                Deconstruct Further
                <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}

        {/* Questions Section */}
        <div className="mt-24 mb-12">
          <h2 className="text-xl font-serif text-zinc-100 tracking-tight">Open Questions</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 font-mono">Inquiries Emerging from Nothingness</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
          {questions.map((q) => (
            <motion.div
              key={q.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onNodeSelect(q)}
              className={cn(
                "neo-convex rounded-3xl p-6 cursor-pointer border border-transparent transition-all duration-300 group",
                selectedNodeId === q.id ? "neo-pressed border-orange-500/20" : "hover:border-white/5"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl neo-pressed flex items-center justify-center text-zinc-500 group-hover:text-orange-400 transition-colors">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Question</span>
              </div>
              <h4 className="text-lg font-serif text-zinc-200 mb-2 group-hover:text-zinc-100 transition-colors">{q.label}</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">{q.content}</p>
              
              <div className="mt-6 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-5 h-5 rounded-full neo-convex border border-zinc-900 flex items-center justify-center text-[7px] text-zinc-600 font-mono">
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-[8px] text-zinc-600 uppercase tracking-tighter ml-2">3 Potential Paths Identified</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
