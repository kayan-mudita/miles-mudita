"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, Flame, Check } from "lucide-react";
import { LabNav } from "@/components/lab/LabNav";

interface Idea {
  id: number;
  title: string;
  description: string;
  votes: number;
  url: string | null;
  status: string;
}

const votedIds = new Set<number>();

function IdeaCard({ idea, hasVoted, onVote }: { idea: Idea; hasVoted: boolean; onVote: () => void }) {
  const [localVotes, setLocalVotes] = useState(idea.votes);
  const [isVoting, setIsVoting] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleVote = async () => {
    if (hasVoted || isVoting) return;
    setIsVoting(true);
    setLocalVotes((v) => v + 1);
    onVote();
    try {
      await fetch(`/api/lab/ideas/${idea.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: "up" }),
      });
    } catch {
      setLocalVotes((v) => v - 1);
    } finally {
      setIsVoting(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!email || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/lab/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ideaId: idea.id }),
      });
      setIsSubscribed(true);
    } catch {
      // silently fail
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={hasVoted ? undefined : { scale: 0.98 }}
      onClick={hasVoted ? undefined : handleVote}
      className={`relative aspect-square rounded-3xl p-4 md:p-6 flex flex-col justify-between overflow-hidden transition-all duration-200 ${
        hasVoted
          ? "bg-white text-black"
          : "bg-white/5 hover:bg-white/10 text-white border border-white/10 cursor-pointer"
      }`}
    >
      <div>
        <h3 className="text-lg font-semibold mb-1">{idea.title}</h3>
        {!hasVoted && (
          <p className="text-sm leading-relaxed line-clamp-3 text-white/60">{idea.description}</p>
        )}
      </div>

      {hasVoted ? (
        <div className="flex flex-col gap-2">
          {isSubscribed ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm font-medium text-black/80"
            >
              <Check className="w-4 h-4" />
              We'll notify you!
            </motion.div>
          ) : (
            <form onSubmit={handleEmail} onClick={(e) => e.stopPropagation()} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-black/20 bg-white text-black placeholder:text-black/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full px-3 py-2 text-sm font-medium rounded-lg bg-black text-white disabled:opacity-50 transition-opacity"
              >
                {isSubmitting ? "..." : "Notify me"}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-white/50" />
          <span className="text-lg font-medium tabular-nums">{localVotes}</span>
        </div>
      )}
    </motion.div>
  );
}

export default function LabPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [votedCount, setVotedCount] = useState(0);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    fetch("/api/lab/ideas")
      .then((r) => r.json())
      .then(setIdeas)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const target = 5;
  const isComplete = votedCount >= target;

  const recordVote = (id: number) => {
    if (!votedIds.has(id)) {
      votedIds.add(id);
      setVotedCount(votedIds.size);
      forceUpdate((n) => n + 1);
    }
  };

  return (
    <>
      <LabNav />
      <main className="pt-14 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Mudita Venture Studio</h1>
            <p className="text-white/60 text-lg mb-6">Tap to vote. We'll build the top 5.</p>

            {isComplete ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-medium"
              >
                <Flame className="w-5 h-5 fill-black" />
                Thanks for voting!
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  {[...Array(target)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-colors ${i < votedCount ? "bg-white" : "bg-white/20"}`}
                    />
                  ))}
                </div>
                <span className="text-white/40 text-sm">{votedCount} of {target} votes</span>
              </div>
            )}
          </div>

          {error ? (
            <div className="py-20 flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-12 h-12 text-white/30" />
              <p className="text-white/60">Failed to load. Please refresh.</p>
            </div>
          ) : loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-white/30" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <AnimatePresence mode="popLayout">
                {ideas.map((idea, i) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <IdeaCard
                      idea={idea}
                      hasVoted={votedIds.has(idea.id)}
                      onVote={() => recordVote(idea.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
