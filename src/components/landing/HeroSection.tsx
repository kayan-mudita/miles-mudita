"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

function FloatingOrb({
  size,
  x,
  y,
  delay,
  duration,
}: {
  size: number;
  x: string;
  y: string;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 2, delay }}
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.03) 50%, transparent 70%)`,
        animationDuration: `${duration}s`,
      }}
    >
      <div
        className="w-full h-full rounded-full animate-float-slow"
        style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
      />
    </motion.div>
  );
}

function GridLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Vertical lines */}
      {[20, 40, 60, 80].map((pos) => (
        <motion.div
          key={`v-${pos}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute top-0 bottom-0 w-px"
          style={{
            left: `${pos}%`,
            background: "linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.04) 30%, rgba(201,168,76,0.04) 70%, transparent 100%)",
          }}
        />
      ))}
      {/* Horizontal lines */}
      {[25, 50, 75].map((pos) => (
        <motion.div
          key={`h-${pos}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1.2 }}
          className="absolute left-0 right-0 h-px"
          style={{
            top: `${pos}%`,
            background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.04) 30%, rgba(201,168,76,0.04) 70%, transparent 100%)",
          }}
        />
      ))}
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient background layers */}
      <div className="absolute inset-0">
        {/* Primary gold glow - large, centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(201,168,76,0.1) 0%, rgba(201,168,76,0.03) 40%, transparent 70%)",
          }}
        />
        {/* Secondary purple undertone */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 0.5 }}
          className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(45,27,78,0.3) 0%, transparent 70%)",
          }}
        />
      </div>

      <GridLines />

      {/* Floating orbs */}
      <FloatingOrb size={300} x="10%" y="20%" delay={0.5} duration={7} />
      <FloatingOrb size={200} x="75%" y="15%" delay={1} duration={9} />
      <FloatingOrb size={150} x="60%" y="65%" delay={1.5} duration={6} />
      <FloatingOrb size={100} x="20%" y="70%" delay={2} duration={8} />
      <FloatingOrb size={80} x="85%" y="50%" delay={0.8} duration={10} />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Mudita badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 border border-gold-500/20 bg-gold-500/5 rounded-full px-5 py-2 mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
          <span className="text-gold-500 text-xs tracking-[0.3em] uppercase font-body font-medium">
            Built by Mudita
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-7xl md:text-9xl text-cream-100 mb-4 text-glow-gold"
        >
          Meet{" "}
          <span className="text-gold-gradient">Miles</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="font-display text-xl md:text-2xl text-cream-200/80 mb-3 italic"
        >
          The AI analyst your startup deserves.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="gold-rule w-24 mx-auto mb-6"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-base md:text-lg text-cream-300 max-w-2xl mx-auto mb-12 leading-relaxed font-body"
        >
          Miles validates startup ideas with institutional-grade research.
          Five dimensions of analysis. Twenty-five real sources. A scored
          PDF report with a clear Go or No-Go — delivered in 40 minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button href="/submit" variant="filled" size="lg">
            Validate Your Idea
          </Button>
          <Button href="/#how-it-works" variant="outline" size="lg">
            See How It Works
          </Button>
        </motion.div>

        {/* Authority stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          {[
            { value: "25+", label: "Sources Per Report" },
            { value: "5", label: "Scoring Dimensions" },
            { value: "12", label: "Sub-Dimensions" },
            { value: "~40m", label: "Turnaround" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 + i * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-2xl md:text-3xl text-gold-500 stat-glow">
                {stat.value}
              </p>
              <p className="text-xs text-cream-300/60 font-body tracking-wider uppercase mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-navy-950 to-transparent" />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 border border-gold-500/30 rounded-full flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-gold-500/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
