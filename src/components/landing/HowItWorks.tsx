"use client";

import { motion } from "framer-motion";
import { PROCESS_STEPS } from "@/lib/constants";
import SoundWave from "@/components/ui/SoundWave";

const icons = [
  <svg key="submit" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  <svg key="research" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  <svg key="report" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32">
      <SoundWave />
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-gold-500 text-xs tracking-[0.3em] uppercase font-body mb-3">
            The Process
          </p>
          <h2 className="font-display text-4xl md:text-6xl text-cream-100 mb-4">
            How Miles Works
          </h2>
          <p className="text-cream-300 font-body max-w-lg mx-auto">
            From idea to institutional-grade report in three simple steps.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line - desktop */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-px">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
              className="h-full origin-left"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3) 20%, rgba(201,168,76,0.3) 80%, transparent)",
              }}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="relative text-center group"
              >
                {/* Icon circle */}
                <div className="relative mx-auto mb-8">
                  <motion.div
                    whileInView={{ scale: [0.8, 1.05, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.2 }}
                    className="w-20 h-20 rounded-full border border-gold-500/20 bg-navy-800 flex items-center justify-center mx-auto group-hover:border-gold-500/50 group-hover:shadow-[0_0_30px_rgba(201,168,76,0.15)] transition-all duration-500"
                  >
                    <div className="text-gold-500 group-hover:text-gold-300 transition-colors">
                      {icons[i]}
                    </div>
                  </motion.div>
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gold-500 text-navy-950 text-xs font-body font-bold flex items-center justify-center">
                    {step.number}
                  </div>
                </div>

                <h3 className="font-display text-2xl text-cream-100 mb-3">
                  {step.title}
                </h3>
                <p className="text-cream-300 text-sm font-body leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <SoundWave className="mt-8" />
    </section>
  );
}
