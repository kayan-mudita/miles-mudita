"use client";

import { motion } from "framer-motion";
import IdeaForm from "@/components/submit/IdeaForm";
import GoldGlow from "@/components/ui/GoldGlow";

export default function SubmitPage() {
  return (
    <section className="relative min-h-screen py-24 overflow-hidden">
      <GoldGlow className="top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" size="lg" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-gold-500 text-xs tracking-[0.3em] uppercase font-body mb-4">
            Start Your Research
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-cream-100 mb-4">
            What&apos;s your big idea?
          </h1>
          <p className="text-cream-300 font-body max-w-md mx-auto">
            Miles will research it across 5 dimensions and deliver a
            comprehensive scored report.
          </p>
        </motion.div>

        <IdeaForm />
      </div>
    </section>
  );
}
