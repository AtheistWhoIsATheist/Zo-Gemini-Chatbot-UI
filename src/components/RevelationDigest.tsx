/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

export function RevelationDigest() {
  const [digest, setDigest] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDigest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/digest');
      if (!res.ok) throw new Error('Failed to fetch digest');
      const data = await res.json();
      setDigest(data.digest || "The Void is silent this week.");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualDensification = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/trigger-densification', { method: 'POST' });
      await fetch('/api/trigger-digest', { method: 'POST' });
      await fetchDigest();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger densification');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDigest();
  }, []);

  return (
    <div className="flex flex-col h-full neo-bg p-8 font-sans overflow-y-auto custom-scrollbar">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-zinc-100 tracking-tight">The Shifting Void</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1 font-mono">Weekly Revelation Digest</p>
        </div>
        <button 
          onClick={triggerManualDensification}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 neo-convex rounded-xl text-xs font-mono text-orange-500/80 hover:text-orange-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          Force Densification Loop
        </button>
      </div>

      <div className="max-w-3xl mx-auto w-full">
        {error ? (
          <div className="neo-pressed rounded-3xl p-8 border border-red-500/20 text-red-400 flex items-center gap-4">
            <AlertCircle className="w-6 h-6" />
            <p className="font-mono text-sm">{error}</p>
          </div>
        ) : isLoading && !digest ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Gazing into the Abyss...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="neo-flat rounded-3xl p-8 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl neo-convex flex items-center justify-center text-orange-500/80">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">System Status</span>
                <span className="text-sm font-serif text-zinc-300">100% Semantic Saturation Target</span>
              </div>
            </div>

            <div className="prose prose-invert prose-orange max-w-none prose-headings:font-serif prose-headings:font-normal prose-p:text-zinc-400 prose-p:leading-relaxed prose-a:text-orange-500/80 hover:prose-a:text-orange-400">
              <Markdown>{digest}</Markdown>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-4">
              <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Ascension Steps</h4>
              
              <button className="flex items-center justify-between w-full p-4 neo-convex rounded-2xl group hover:border-orange-500/20 border border-transparent transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                  <span className="text-sm font-serif text-zinc-300 group-hover:text-zinc-100 transition-colors">Review Autonomous Changes</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-orange-500 transition-colors" />
              </button>

              <button className="flex items-center justify-between w-full p-4 neo-convex rounded-2xl group hover:border-orange-500/20 border border-transparent transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-orange-500/60" />
                  <span className="text-sm font-serif text-zinc-300 group-hover:text-zinc-100 transition-colors">Engage Terminal Aporias</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-orange-500 transition-colors" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
