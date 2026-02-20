"use client";

import { motion } from "framer-motion";
import GoldGlow from "@/components/ui/GoldGlow";
import { TRACKING_STAGES } from "@/lib/constants";

const ACTIVE_STAGE = 1; // "Researching" is active
const PROGRESS = 65;

export default function MockupTracking() {
  return (
    <section className="relative min-h-screen py-24 overflow-hidden">
      <GoldGlow className="top-0 left-1/2 -translate-x-1/2" size="lg" />

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-gold-500 text-xs tracking-[0.3em] uppercase font-body mb-4">
            Researching
          </p>
          <h1 className="font-display text-4xl text-cream-100 mb-3">
            Miles is on it
          </h1>
          <p className="text-cream-300 text-sm font-body">
            Your report for &ldquo;AI-Powered Meal Planning App&rdquo; is being generated.
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-1 bg-gold-500/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gold-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${PROGRESS}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-cream-300/50 text-xs font-body">{PROGRESS}%</p>
            <p className="text-cream-300/50 text-xs font-body">
              About 14 minutes remaining
            </p>
          </div>
        </div>

        {/* Detail text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-cream-300 text-sm font-body text-center mb-8"
        >
          Deep research across 1000+ sources
        </motion.p>

        {/* Stage timeline */}
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-px bg-gold-500/15" />

          {TRACKING_STAGES.map((stage, i) => {
            const isActive = i === ACTIVE_STAGE;
            const isStageComplete = i < ACTIVE_STAGE;

            return (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative flex items-start gap-5 mb-8 last:mb-0"
              >
                {/* Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                      isActive
                        ? "border-gold-500 bg-gold-500/20 pulse-gold"
                        : isStageComplete
                        ? "border-gold-500 bg-gold-500"
                        : "border-gold-500/20 bg-navy-800"
                    }`}
                  >
                    {isStageComplete ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="text-navy-950"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : isActive ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-gold-500 animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gold-500/20" />
                    )}
                  </div>
                </div>

                {/* Text */}
                <div className="pt-1.5">
                  <h3
                    className={`font-display text-lg transition-colors duration-300 ${
                      isActive
                        ? "text-gold-500"
                        : isStageComplete
                        ? "text-cream-100"
                        : "text-cream-300/50"
                    }`}
                  >
                    {stage.label}
                  </h3>
                  <p
                    className={`text-sm font-body transition-colors duration-300 ${
                      isActive || isStageComplete
                        ? "text-cream-300"
                        : "text-cream-300/30"
                    }`}
                  >
                    {stage.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
