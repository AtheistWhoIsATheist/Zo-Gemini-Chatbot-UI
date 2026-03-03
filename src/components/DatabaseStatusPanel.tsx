/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Activity, HardDrive, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DatabaseStatusPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodeCount: number;
  lastSync: string;
  onReIndex: () => Promise<void>;
}

export function DatabaseStatusPanel({ isOpen, onClose, nodeCount, lastSync, onReIndex }: DatabaseStatusPanelProps) {
  const [isReindexing, setIsReindexing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');
  const [storageSaturation, setStorageSaturation] = useState(0);

  // Simulate storage saturation calculation
  useEffect(() => {
    if (isOpen) {
      // Mock calculation: nodeCount * random factor / arbitrary limit
      const saturation = Math.min(100, Math.round((nodeCount * 150) / 5000 * 100));
      setStorageSaturation(saturation);
    }
  }, [isOpen, nodeCount]);

  // Heartbeat simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(prev => prev === 'connected' ? 'connected' : 'connected');
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleReIndexClick = async () => {
    setIsReindexing(true);
    try {
      await onReIndex();
      setTimeout(() => setIsReindexing(false), 1500); // Minimum visual duration
    } catch (error) {
      console.error("Re-index failed", error);
      setIsReindexing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 neo-bg border-r border-white/10 z-50 p-6 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl neo-convex flex items-center justify-center text-orange-500">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif text-zinc-100">Nexus Interface</h2>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Database Status</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full neo-convex flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="space-y-6 flex-1">
              
              {/* Connection Health */}
              <div className="neo-flat rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Connection Health</span>
                  <Activity className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">Active / Stable</span>
                </div>
                <div className="mt-3 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                  />
                </div>
              </div>

              {/* Node Count */}
              <div className="neo-flat rounded-2xl p-4 border border-white/5">
                <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider block mb-1">Total Nodes</span>
                <div className="text-3xl font-serif text-zinc-100">{nodeCount}</div>
                <div className="text-[10px] text-zinc-600 mt-1">Entities in the Void</div>
              </div>

              {/* Storage Saturation */}
              <div className="neo-flat rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Storage Saturation</span>
                  <span className="text-xs text-orange-400 font-mono">{storageSaturation}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${storageSaturation}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Last Sync */}
              <div className="neo-flat rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Last Sync</span>
                <span className="text-xs text-zinc-200 font-mono">{lastSync}</span>
              </div>

            </div>

            {/* Actions */}
            <div className="mt-auto pt-6 border-t border-white/10">
              <button
                onClick={handleReIndexClick}
                disabled={isReindexing}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <RefreshCw className={`w-4 h-4 ${isReindexing ? 'animate-spin text-orange-500' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                {isReindexing ? 'Re-Indexing...' : 'Force Re-Index'}
              </button>
              
              {isReindexing && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center justify-center gap-2 text-[10px] text-emerald-500"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Global State Refreshed</span>
                </motion.div>
              )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
