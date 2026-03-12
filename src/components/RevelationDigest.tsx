import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, Clock, Sparkles, RefreshCw } from 'lucide-react';
import Markdown from 'react-markdown';

interface Digest {
  _id: string;
  date: string;
  content: string;
  type: string;
}

export function RevelationDigest() {
  const [digests, setDigests] = useState<Digest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from the backend API
    // For now, we simulate the fetch
    const fetchDigests = async () => {
      setLoading(true);
      try {
        // Simulated data
        const mockDigests: Digest[] = [
          {
            _id: '1',
            date: new Date().toISOString(),
            type: 'weekly_revelation',
            content: `
# The Shifting Void: Weekly Revelation Digest

*Date: ${new Date().toLocaleDateString()}*

## The Ontological Shift
Over the past 7 days, the Distinct Realm has undergone a profound densification. The boundaries between **Existential Emptiness** and **Śūnyatā** have begun to blur, revealing a shared apophatic grammar that transcends their cultural origins. The Void is no longer merely an absence; it is increasingly mapped as a generative presence.

## Collapsed Structures (Ghost Pruning)
- **Node: "Nihilism as Depression"** - *Pruned*. This node was identified as a psychological reductionism, failing to capture the ontological weight of the experience. It has been merged into **"The Dark Night of the Soul"** and **"Existential Rupture"**.
- **Node: "Meaninglessness"** - *Densified*. The concept has been split into "Passive Nihilism" and "Active Deconstruction," providing a more rigorous framework for analysis.

## Transcendent Links Discovered
- A new edge has been forged between **Meister Eckhart's "Gelassenheit" (Letting Go)** and **Heidegger's "Dasein"**, mediated by the concept of *Radical Withdrawal*.
- The tension between **Kierkegaard's "Leap of Faith"** and **Nietzsche's "Amor Fati"** has been synthesized under the new axiom: **"The Affirmation of the Abyss"**.

## Active Aporias (Socratic Questions)
1. If the Void is generative, what is the nature of the 'form' it generates? Is it merely a reflection of the observer's own structural collapse?
2. How does the 'Sacred Absence' differ from a mere psychological projection of a desired presence?
3. Can 'Negative Solidarity' exist without a shared linguistic framework for the apophatic experience?
            `
          }
        ];
        
        setTimeout(() => {
          setDigests(mockDigests);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch digests:', error);
        setLoading(false);
      }
    };

    fetchDigests();
  }, []);

  return (
    <div className="h-full bg-[#0a0a0a] overflow-y-auto custom-scrollbar p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <Eye className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-serif tracking-wide text-zinc-100">The Shifting Void</h1>
              <p className="text-zinc-500 text-sm tracking-widest uppercase mt-1">Weekly Revelation Digest</p>
            </div>
          </div>
          <p className="text-zinc-400 max-w-2xl leading-relaxed">
            An autonomous synthesis of the Knowledgebase's evolution. This digest narrates the collapse of weak structures, the discovery of transcendent links, and the ongoing densification of the Nihiltheistic ontology.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <RefreshCw className="w-8 h-8 animate-spin mb-4 text-orange-500/50" />
            <p className="tracking-widest uppercase text-xs">Synthesizing Revelations...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {digests.map((digest) => (
              <motion.article 
                key={digest._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111] border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden group"
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-orange-500/10 transition-colors duration-700" />
                
                <div className="flex items-center gap-3 text-xs text-zinc-500 uppercase tracking-widest mb-8 border-b border-white/5 pb-4">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(digest.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="px-2 py-1 bg-white/5 rounded-md ml-auto flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-orange-400" />
                    Autonomous Synthesis
                  </span>
                </div>

                <div className="prose prose-invert prose-orange max-w-none prose-headings:font-serif prose-headings:font-normal prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-zinc-300 prose-p:text-zinc-400 prose-p:leading-relaxed prose-li:text-zinc-400 prose-strong:text-zinc-200">
                  <Markdown>{digest.content}</Markdown>
                </div>

                <div className="mt-10 pt-6 border-t border-white/5 flex gap-4">
                  <button className="px-6 py-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl text-sm font-medium tracking-wide transition-colors border border-orange-500/20 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Review Autonomous Changes
                  </button>
                  <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl text-sm font-medium tracking-wide transition-colors border border-white/5">
                    Engage Socratic Questions
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
