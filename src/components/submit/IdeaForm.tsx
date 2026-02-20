"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

type Step = "form" | "confirm";
type Depth = "QUICK" | "STANDARD" | "DEEP";

const DEPTH_OPTIONS: { value: Depth; label: string; time: string; desc: string }[] = [
  { value: "QUICK", label: "Quick", time: "~5 min", desc: "1 research round, fast overview" },
  { value: "STANDARD", label: "Standard", time: "~25 min", desc: "3 research rounds, comprehensive" },
  { value: "DEEP", label: "Deep", time: "~45 min", desc: "5 research rounds, institutional-grade" },
];

export default function IdeaForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    reportName: "",
    searchTopic: "",
    depth: "STANDARD" as Depth,
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    setStep("confirm");
  }

  async function handleConfirm() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      const data = await res.json();
      const jobId = data.jobId;

      router.push(
        `/tracking?jobId=${encodeURIComponent(jobId)}&name=${encodeURIComponent(form.reportName)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-navy-800 border border-gold-500/15 rounded-sm px-4 py-3 text-cream-100 font-body placeholder:text-cream-300/30 focus:outline-none focus:border-gold-500/50 focus:shadow-[0_0_15px_rgba(201,168,76,0.1)] transition-all";

  const selectedDepth = DEPTH_OPTIONS.find((d) => d.value === form.depth)!;

  return (
    <div className="max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.form
            key="form"
            onSubmit={handleReview}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="reportName"
                className="block text-cream-200 text-sm font-body mb-1.5"
              >
                Report Name
              </label>
              <input
                id="reportName"
                name="reportName"
                type="text"
                required
                value={form.reportName}
                onChange={handleChange}
                placeholder="e.g. AI Pet Food Delivery"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="searchTopic"
                className="block text-cream-200 text-sm font-body mb-1.5"
              >
                Describe Your Startup Idea
              </label>
              <textarea
                id="searchTopic"
                name="searchTopic"
                required
                rows={5}
                value={form.searchTopic}
                onChange={handleChange}
                placeholder="Describe your startup concept — the problem, your solution, and who it's for..."
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Research Depth Selector */}
            <div>
              <label className="block text-cream-200 text-sm font-body mb-2">
                Research Depth
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DEPTH_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, depth: opt.value }))}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      form.depth === opt.value
                        ? "border-gold-500 bg-gold-500/10"
                        : "border-gold-500/15 bg-navy-800 hover:border-gold-500/30"
                    }`}
                  >
                    <p className={`font-display text-sm ${
                      form.depth === opt.value ? "text-gold-500" : "text-cream-100"
                    }`}>
                      {opt.label}
                    </p>
                    <p className="text-cream-300/50 text-xs font-body mt-0.5">
                      {opt.time}
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-cream-300/40 text-xs font-body mt-1.5">
                {selectedDepth.desc}
              </p>
            </div>

            <Button
              type="submit"
              variant="filled"
              size="lg"
              className="w-full"
            >
              Review Submission
            </Button>

            <p className="text-center text-cream-300/50 text-xs font-body">
              Reports take {selectedDepth.time}. We&apos;ll email you when ready.
            </p>
          </motion.form>
        )}

        {step === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-navy-800 border border-gold-500/15 rounded-lg p-6 space-y-4">
              <p className="text-gold-500 text-xs tracking-[0.3em] uppercase font-body mb-2">
                Confirm Your Submission
              </p>

              <div>
                <p className="text-cream-300 text-xs font-body uppercase tracking-wider mb-1">
                  Report Name
                </p>
                <p className="text-cream-100 font-body">{form.reportName}</p>
              </div>

              <div>
                <p className="text-cream-300 text-xs font-body uppercase tracking-wider mb-1">
                  Research Depth
                </p>
                <p className="text-cream-100 font-body">
                  {selectedDepth.label} ({selectedDepth.time})
                </p>
              </div>

              <div>
                <p className="text-cream-300 text-xs font-body uppercase tracking-wider mb-1">
                  Startup Idea
                </p>
                <p className="text-cream-100 font-body leading-relaxed">
                  {form.searchTopic}
                </p>
              </div>
            </div>

            <p className="text-cream-300 text-sm font-body text-center">
              Does everything look correct? Once confirmed, Miles will begin
              researching your idea.
            </p>

            {error && (
              <p className="text-red-400 text-sm font-body text-center">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep("form")}
                className="flex-1"
              >
                Go Back & Edit
              </Button>
              <Button
                variant="filled"
                size="lg"
                loading={loading}
                disabled={loading}
                onClick={handleConfirm}
                className="flex-1"
              >
                Confirm & Launch
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
