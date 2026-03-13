"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import ProgressTracker from "@/components/tracking/ProgressTracker";
import GoldGlow from "@/components/ui/GoldGlow";
import Button from "@/components/ui/Button";

function TrackingContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;
  const email = session?.user?.email || searchParams.get("email") || "your email";
  const reportName = searchParams.get("name") || "your idea";
  const jobId = searchParams.get("jobId") || "";
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const signupUrl = `/signup?callbackUrl=${encodeURIComponent(`/tracking?jobId=${jobId}&name=${encodeURIComponent(reportName)}`)}`;

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
            {isLoggedIn
              ? " You can view your report on your dashboard when it's ready."
              : " Your report will be ready shortly."}
          </p>
        </motion.div>

        <ProgressTracker jobId={jobId} />

        {/* Anonymous account nudge */}
        {!isLoggedIn && !nudgeDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 bg-navy-800 border border-gold-500/20 rounded-lg p-6 relative"
          >
            <button
              onClick={() => setNudgeDismissed(true)}
              className="absolute top-3 right-3 text-cream-300/40 hover:text-cream-100 transition-colors"
              aria-label="Dismiss"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-display text-lg text-cream-100 mb-2">
              Save Your Research
            </h3>
            <p className="text-cream-300 text-sm font-body mb-4 max-w-lg">
              Create a free account to keep this report and all future reports
              in one place. Track progress, compare ideas, and download PDFs.
            </p>
            <Button href={signupUrl} variant="filled" size="md">
              Create Free Account
            </Button>
            <p className="text-cream-300/40 text-xs font-body mt-3 italic">
              We&apos;ll link this report to your new account.
            </p>
          </motion.div>
        )}

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
