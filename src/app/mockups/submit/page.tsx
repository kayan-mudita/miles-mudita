"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import GoldGlow from "@/components/ui/GoldGlow";
import { DEMO_FORM } from "../data";

const DEPTH_OPTIONS = [
  { value: "QUICK", label: "Quick", time: "~5 min", desc: "1 research round, fast overview" },
  { value: "STANDARD", label: "Standard", time: "~25 min", desc: "3 research rounds, comprehensive" },
  { value: "DEEP", label: "Deep", time: "~45 min", desc: "5 research rounds, institutional-grade" },
];

const inputClass =
  "w-full bg-navy-800 border border-gold-500/15 rounded-sm px-4 py-3 text-cream-100 font-body placeholder:text-cream-300/30 focus:outline-none focus:border-gold-500/50 focus:shadow-[0_0_15px_rgba(201,168,76,0.1)] transition-all";

export default function MockupSubmit() {
  const selectedDepth = DEPTH_OPTIONS.find((d) => d.value === DEMO_FORM.depth)!;

  return (
    <section className="relative min-h-screen py-24 overflow-hidden">
      <GoldGlow className="top-0 left-1/2 -translate-x-1/2" size="lg" />

      <div className="relative z-10 max-w-lg mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-gold-500 text-xs tracking-[0.3em] uppercase font-body mb-4">
            New Report
          </p>
          <h1 className="font-display text-4xl text-cream-100 mb-3">
            Validate Your Idea
          </h1>
          <p className="text-cream-300 text-sm font-body">
            Describe your startup concept and Miles will research it.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-5"
        >
          <div>
            <label className="block text-cream-200 text-sm font-body mb-1.5">
              Report Name
            </label>
            <input
              type="text"
              readOnly
              value={DEMO_FORM.reportName}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-cream-200 text-sm font-body mb-1.5">
              Describe Your Startup Idea
            </label>
            <textarea
              readOnly
              rows={5}
              value={DEMO_FORM.searchTopic}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="block text-cream-200 text-sm font-body mb-2">
              Research Depth
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DEPTH_OPTIONS.map((opt) => (
                <div
                  key={opt.value}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    DEMO_FORM.depth === opt.value
                      ? "border-gold-500 bg-gold-500/10"
                      : "border-gold-500/15 bg-navy-800"
                  }`}
                >
                  <p
                    className={`font-display text-sm ${
                      DEMO_FORM.depth === opt.value ? "text-gold-500" : "text-cream-100"
                    }`}
                  >
                    {opt.label}
                  </p>
                  <p className="text-cream-300/50 text-xs font-body mt-0.5">
                    {opt.time}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-cream-300/40 text-xs font-body mt-1.5">
              {selectedDepth.desc}
            </p>
          </div>

          <Button variant="filled" size="lg" className="w-full">
            Review Submission
          </Button>

          <p className="text-center text-cream-300/50 text-xs font-body">
            Reports take {selectedDepth.time}. We&apos;ll email you when ready.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
