"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function CTABanner() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-gold-500 text-xs tracking-[0.3em] uppercase font-body mb-4"
        >
          Ready to Begin?
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl md:text-6xl text-cream-100 mb-6 text-glow-gold"
        >
          Stop guessing.<br />Start validating.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="gold-rule w-16 mx-auto mb-6"
        />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-cream-300 font-body mb-10 max-w-lg mx-auto leading-relaxed"
        >
          Submit your idea and let Miles do what would take a research team
          weeks — in under an hour.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button href="/submit" variant="filled" size="lg">
            Validate Your Idea Now
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
