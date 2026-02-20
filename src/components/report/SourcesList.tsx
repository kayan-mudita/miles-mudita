"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type SourceGroup = {
  dimension: string;
  sources: { url: string; title: string; content: string }[];
};

type SourcesListProps = {
  groups: SourceGroup[];
  totalCount: number;
};

export default function SourcesList({ groups, totalCount }: SourcesListProps) {
  const [expanded, setExpanded] = useState(false);

  let globalIndex = 0;

  return (
    <section id="sources" className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-cream-100">
          Sources ({totalCount})
        </h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gold-500 text-sm font-body hover:text-gold-300 transition-colors"
        >
          {expanded ? "Collapse" : "Expand All"}
        </button>
      </div>

      {groups.map((group) => (
        <motion.div
          key={group.dimension}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h3 className="font-display text-lg text-cream-200 mb-3">
            {group.dimension}
          </h3>
          <ol
            start={globalIndex + 1}
            className="space-y-1.5 text-sm font-body text-cream-300/70"
          >
            {group.sources.map((s, i) => {
              globalIndex++;
              const show = expanded || i < 5;
              if (!show) return null;
              return (
                <li key={`${s.url}-${i}`} className="flex gap-2">
                  <span className="text-gold-500/50 shrink-0">
                    [{globalIndex}]
                  </span>
                  <span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-500 hover:underline"
                    >
                      {s.title}
                    </a>
                    {s.content && (
                      <span className="text-cream-300/40">
                        {" "}
                        — {s.content.substring(0, 100)}...
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
            {!expanded && group.sources.length > 5 && (
              <li className="text-cream-300/30 italic">
                +{group.sources.length - 5} more sources
              </li>
            )}
          </ol>
        </motion.div>
      ))}
    </section>
  );
}
