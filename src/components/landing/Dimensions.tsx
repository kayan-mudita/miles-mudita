"use client";

import { motion } from "framer-motion";
import { DIMENSIONS } from "@/lib/constants";

const dimensionIcons: Record<string, React.ReactNode> = {
  globe: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  ),
  chess: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 16l-1.447.724a1 1 0 00-.553.894V20h12v-2.382a1 1 0 00-.553-.894L16 16"/><path d="M8.5 16V14a4 4 0 014-4h0a4 4 0 014 4v2"/><path d="M12 6V2"/><path d="M9 2h6"/><circle cx="12" cy="8" r="2"/>
    </svg>
  ),
  diamond: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20"/><path d="M10 3l-4 6"/><path d="M14 3l4 6"/><path d="M12 22l-2-13"/><path d="M12 22l2-13"/>
    </svg>
  ),
  target: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  chart: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/><path d="M18 9l-5 5-2-2-4 4"/>
    </svg>
  ),
};

export default function Dimensions() {
  return (
    <section id="dimensions" className="relative py-24 bg-navy-900">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-gold-500 text-xs tracking-[0.3em] uppercase font-body mb-3">
            Rigorous Analysis
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-cream-100 mb-4">
            Five Dimensions of Validation
          </h2>
          <p className="text-cream-300 max-w-xl mx-auto font-body">
            Each dimension is scored 1–10 with evidence-based reasoning, then
            rolled into an overall viability assessment.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIMENSIONS.map((dim, i) => (
            <motion.div
              key={dim.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-navy-800 rounded-lg p-6 border border-gold-500/10 hover:border-gold-500/30 hover:shadow-[0_0_30px_rgba(201,168,76,0.08)] transition-all group"
            >
              <div className="text-gold-500 mb-4 group-hover:text-gold-300 transition-colors">
                {dimensionIcons[dim.icon]}
              </div>
              <h3 className="font-display text-lg text-cream-100 mb-2">
                {dim.title}
              </h3>
              <p className="text-cream-300 text-sm font-body leading-relaxed">
                {dim.description}
              </p>
            </motion.div>
          ))}

          {/* Scoring preview card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-br from-gold-500/10 to-navy-800 rounded-lg p-6 border border-gold-500/20 flex flex-col justify-center"
          >
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-display text-5xl text-gold-500">8.4</span>
              <span className="text-cream-300/50 text-sm font-body">/10</span>
            </div>
            <p className="text-cream-200 font-display text-lg mb-1">
              Sample Overall Score
            </p>
            <p className="text-cream-300 text-sm font-body">
              Weighted composite across all five dimensions with Go/No-Go
              recommendation.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
