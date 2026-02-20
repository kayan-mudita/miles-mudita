"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import ProgressTracker from "@/components/tracking/ProgressTracker";
import GoldGlow from "@/components/ui/GoldGlow";
import Button from "@/components/ui/Button";

function TrackingContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";
  const reportName = searchParams.get("name") || "your idea";
  const jobId = searchParams.get("jobId") || "";

  return (
    <section className="relative min-h-screen py-24 overflow-hidden">
      <GoldGlow
        className="top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2"
        size="lg"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-gold-500 text-xs tracking-[0.3em] uppercase font-body mb-4">
            Research In Progress
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-cream-100 mb-4">
            Miles is on it.
          </h1>
          <p className="text-cream-300 font-body max-w-md mx-auto">
            Researching <span className="text-cream-100">{reportName}</span>.
            Your report will be delivered to{" "}
            <span className="text-gold-500">{email}</span>.
          </p>
        </motion.div>

        <ProgressTracker jobId={jobId} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Button href="/submit" variant="outline" size="md">
            Validate Another Idea
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
