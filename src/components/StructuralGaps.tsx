import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Node, corpusLinks } from "../data/corpus";
import {
  Network,
  AlertTriangle,
  Link as LinkIcon,
  Sparkles,
  ArrowRight,
  Map as MapIcon,
  Layers,
} from "lucide-react";
import { cn } from "../lib/utils";

export function StructuralGaps({
  nodes,
  onNodeSelect,
}: {
  nodes: Node[];
  onNodeSelect: (node: Node) => void;
}) {
  const [activeTab, setActiveTab] = useState<"patterns" | "unified" | "hubs">(
    "patterns",
  );

  const analysis = useMemo(() => {
    const degrees = new Map<string, number>();
    nodes.forEach((n) => degrees.set(n.id, 0));

    corpusLinks.forEach((link) => {
      const sourceId =
        typeof link.source === "string" ? link.source : (link.source as any).id;
      const targetId =
        typeof link.target === "string" ? link.target : (link.target as any).id;
      degrees.set(sourceId, (degrees.get(sourceId) || 0) + 1);
      degrees.set(targetId, (degrees.get(targetId) || 0) + 1);
    });

    const isolated = nodes.filter((n) => (degrees.get(n.id) || 0) === 0);
    const underconnected = nodes.filter((n) => {
      const deg = degrees.get(n.id) || 0;
      return deg > 0 && deg <= 2;
    });

    const hubs = [...nodes]
      .sort((a, b) => (degrees.get(b.id) || 0) - (degrees.get(a.id) || 0))
      .slice(0, 10);

    // Generate suggestions based on shared tags but no links
    const suggestions: { source: Node; target: Node; reason: string }[] = [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];

        const isLinked = corpusLinks.some((l) => {
          const sId = typeof l.source === "string" ? l.source : (l.source as any).id;
          const tId = typeof l.target === "string" ? l.target : (l.target as any).id;
          return (
            (sId === n1.id && tId === n2.id) || (sId === n2.id && tId === n1.id)
          );
        });

        if (!isLinked) {
          const tags1 = n1.metadata?.tags || [];
          const tags2 = n2.metadata?.tags || [];
          const sharedTags = tags1.filter((t) => tags2.includes(t));

          if (sharedTags.length >= 2) {
            suggestions.push({
              source: n1,
              target: n2,
              reason: `Shared conceptual space: ${sharedTags.join(", ")}`,
            });
          } else if (
            sharedTags.length === 1 &&
            (n1.type === "concept" ||
              n2.type === "concept" ||
              n1.type === "experience" ||
              n2.type === "experience")
          ) {
            suggestions.push({
              source: n1,
              target: n2,
              reason: `Potential unified voice via: ${sharedTags[0]}`,
            });
          }
        }
      }
    }

    return {
      isolated,
      underconnected,
      hubs,
      suggestions: suggestions.slice(0, 20),
      degrees,
    };
  }, [nodes]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] text-zinc-100 p-8 overflow-hidden">
      <div className="flex items-center gap-3 mb-2">
        <MapIcon className="w-6 h-6 text-orange-500" />
        <h1 className="text-2xl font-light tracking-tight">
          Strategic Diagnostic Tool
        </h1>
      </div>
      <p className="text-sm text-zinc-500 mb-8 max-w-3xl leading-relaxed">
        Acting as a cartographer mapping an uncharted intellectual terrain. This
        module exposes the interwoven fabric of Journal314 and its 52 thinkers,
        translating the labyrinth of modern thought into actionable,
        transformative insights.
      </p>

      <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("patterns")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "patterns"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200",
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          Hidden Patterns (
          {analysis.isolated.length + analysis.underconnected.length})
        </button>
        <button
          onClick={() => setActiveTab("unified")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "unified"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200",
          )}
        >
          <Sparkles className="w-4 h-4" />
          The Unified Voice ({analysis.suggestions.length})
        </button>
        <button
          onClick={() => setActiveTab("hubs")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "hubs"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200",
          )}
        >
          <Layers className="w-4 h-4" />
          Complexity Simplification
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        {activeTab === "patterns" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-medium text-zinc-300 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Isolated
                Concepts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.isolated.map((node) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-zinc-900/50 border border-red-500/20 rounded-xl hover:border-red-500/50 transition-colors cursor-pointer group"
                    onClick={() => onNodeSelect(node)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] uppercase tracking-widest text-red-400 font-bold">
                        {node.type}
                      </span>
                      <span className="text-xs text-zinc-500">0 Links</span>
                    </div>
                    <h3 className="text-lg font-medium text-zinc-200 group-hover:text-white transition-colors">
                      {node.label}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-2 line-clamp-2">
                      Isolated in the labyrinth. Requires integration into the
                      broader phenomenological map.
                    </p>
                  </motion.div>
                ))}
                {analysis.isolated.length === 0 && (
                  <div className="col-span-full text-sm text-zinc-500">
                    No isolated concepts found.
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-zinc-300 mb-4 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-orange-400" /> Underconnected
                Motifs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.underconnected.map((node) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-zinc-900/50 border border-orange-500/20 rounded-xl hover:border-orange-500/50 transition-colors cursor-pointer group"
                    onClick={() => onNodeSelect(node)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] uppercase tracking-widest text-orange-400 font-bold">
                        {node.type}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {analysis.degrees.get(node.id)} Links
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-zinc-200 group-hover:text-white transition-colors">
                      {node.label}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-2 line-clamp-2">
                      Emerging structural pattern. Expand connections to reveal
                      evolutionary shifts.
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "unified" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-400 mb-4">
              Transforming abstract textual similarities into concrete, visual
              evidence. These suggested links steelman the argument against
              cultural reductionism by bridging historically opposed traditions.
            </p>
            {analysis.suggestions.map((sug, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 bg-zinc-900/50 border border-emerald-500/20 rounded-xl flex items-center justify-between hover:border-emerald-500/50 transition-colors"
              >
                <div
                  className="flex-1 cursor-pointer group"
                  onClick={() => onNodeSelect(sug.source)}
                >
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                    {sug.source.type}
                  </div>
                  <div className="text-base font-medium text-zinc-300 group-hover:text-emerald-400 transition-colors">
                    {sug.source.label}
                  </div>
                </div>

                <div className="flex flex-col items-center px-8 text-zinc-500">
                  <ArrowRight className="w-5 h-5 mb-1 text-emerald-500/50" />
                  <span className="text-[10px] uppercase tracking-wider text-emerald-500/70 text-center max-w-[200px]">
                    {sug.reason}
                  </span>
                </div>

                <div
                  className="flex-1 text-right cursor-pointer group"
                  onClick={() => onNodeSelect(sug.target)}
                >
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                    {sug.target.type}
                  </div>
                  <div className="text-base font-medium text-zinc-300 group-hover:text-emerald-400 transition-colors">
                    {sug.target.label}
                  </div>
                </div>
              </motion.div>
            ))}
            {analysis.suggestions.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                The Unified Voice is fully mapped. No new cross-tradition links
                suggested.
              </div>
            )}
          </div>
        )}

        {activeTab === "hubs" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-400 mb-4">
              Translating complex existential theories into accessible,
              transformative insights for leadership. These core hubs represent
              the foundational pillars of the corpus.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.hubs.map((node, idx) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-5 bg-zinc-900/50 border border-blue-500/20 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer group flex items-start gap-4"
                  onClick={() => onNodeSelect(node)}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                    <span className="text-blue-400 font-bold text-lg">
                      {analysis.degrees.get(node.id)}
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1">
                      {node.type}
                    </div>
                    <h3 className="text-lg font-medium text-zinc-200 group-hover:text-white transition-colors">
                      {node.label}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                      Core conceptual hub. Essential for executive
                      comprehension.
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
