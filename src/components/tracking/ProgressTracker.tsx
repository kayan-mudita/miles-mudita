"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { TRACKING_STAGES } from "@/lib/constants";
import Button from "@/components/ui/Button";

type ProgressTrackerProps = {
  jobId: string;
};

type StatusData = {
  stage: string;
  progress: number;
  detail: string;
  status: string;
  estimatedMinutes?: number;
};

function formatTimeRemaining(minutes: number): string {
  if (minutes < 1) return "Less than a minute";
  if (minutes === 1) return "About 1 minute";
  if (minutes < 60) return `About ${Math.round(minutes)} minutes`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `About ${hrs} hour${hrs > 1 ? "s" : ""}`;
  return `About ${hrs}h ${mins}m`;
}

export default function ProgressTracker({ jobId }: ProgressTrackerProps) {
  const router = useRouter();
  const [activeStage, setActiveStage] = useState(0);
  const [detail, setDetail] = useState("Initializing...");
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setStartedAt(Date.now());
  }, []);

  // Calculate remaining time based on progress and elapsed time
  const timeRemaining = (() => {
    if (!estimatedMinutes || progress <= 0 || isComplete || isFailed) return null;
    const elapsedMs = Date.now() - startedAt;
    const elapsedMinutes = elapsedMs / 60000;
    if (progress > 5) {
      // Estimate based on actual progress rate
      const ratePerMinute = progress / elapsedMinutes;
      const remaining = (100 - progress) / ratePerMinute;
      return Math.max(0.5, remaining);
    }
    // Early stage — use the estimate from server
    const pctRemaining = (100 - progress) / 100;
    return estimatedMinutes * pctRemaining;
  })();

  useEffect(() => {
    if (!jobId) return;

    // Poll the status endpoint every 3 seconds
    const poll = async () => {
      try {
        const res = await fetch(`/api/status/${jobId}`);
        if (!res.ok) return;
        const data: StatusData = await res.json();
        setDetail(data.detail);
        setProgress(data.progress);
        if (data.estimatedMinutes) {
          setEstimatedMinutes(data.estimatedMinutes);
        }

        const stageIndex = TRACKING_STAGES.findIndex(
          (s) => s.stage === data.stage
        );
        if (stageIndex >= 0) setActiveStage(stageIndex);

        if (data.status === "completed") {
          setIsComplete(true);
          setActiveStage(TRACKING_STAGES.length - 1);
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        } else if (data.status === "failed") {
          setIsFailed(true);
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      } catch {
        // Ignore poll errors
      }
    };

    // Initial fetch immediately
    poll();
    const pollInterval = setInterval(poll, 3000);
    pollIntervalRef.current = pollInterval;

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [jobId]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-1 bg-gold-500/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gold-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-cream-300/50 text-xs font-body">
            {progress}%
          </p>
          {timeRemaining != null && !isComplete && !isFailed && (
            <p className="text-cream-300/50 text-xs font-body">
              {formatTimeRemaining(timeRemaining)} remaining
            </p>
          )}
        </div>
      </div>

      {/* Detail text */}
      <motion.p
        key={detail}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-cream-300 text-sm font-body text-center mb-8"
      >
        {detail}
      </motion.p>

      <div className="relative">
        {/* Connector line */}
        <div className="absolute left-5 top-5 bottom-5 w-px bg-gold-500/15" />

        {TRACKING_STAGES.map((stage, i) => {
          const isActive = i === activeStage;
          const isStageComplete = i < activeStage || (isComplete && i <= activeStage);

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
                    isActive && !isComplete
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
                    isActive && !isComplete
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

      {/* View Report button when complete */}
      {isComplete && jobId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-12"
        >
          <Button
            variant="filled"
            size="lg"
            onClick={() => router.push(`/report/${jobId}`)}
          >
            View Your Report
          </Button>
        </motion.div>
      )}

      {/* Error state */}
      {isFailed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8"
        >
          <p className="text-red-400 text-sm font-body mb-4">
            Something went wrong generating your report. Please try again.
          </p>
          <Button href="/submit" variant="outline" size="md">
            Try Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
