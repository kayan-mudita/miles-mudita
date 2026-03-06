"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

type Step = "mode" | "form" | "confirm";
type Mode = "quick" | "deep";
type Depth = "QUICK" | "STANDARD" | "DEEP";

const DEPTH_OPTIONS: { value: Depth; label: string; time: string; desc: string }[] = [
  { value: "QUICK", label: "Quick", time: "~5 min", desc: "1 research round, fast overview" },
  { value: "STANDARD", label: "Standard", time: "~25 min", desc: "3 research rounds, comprehensive" },
  { value: "DEEP", label: "Deep", time: "~45 min", desc: "5 research rounds, institutional-grade" },
];

const GUIDED_FIELDS = [
  { key: "problem", label: "What big problem are you solving?", placeholder: "Describe the pain point or unmet need your idea addresses..." },
  { key: "icp", label: "Who is your ideal customer?", placeholder: "Describe your target customer — demographics, role, industry..." },
  { key: "competitors", label: "Who are the key current competitors?", placeholder: "List known competitors or alternatives your customers use today..." },
  { key: "pricing", label: "What do you plan to charge?", placeholder: "Pricing model, price point, or range you're considering..." },
  { key: "founders", label: "Who are the founders?", placeholder: "Background, relevant experience, and team composition..." },
] as const;

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ".pdf,.pptx,.ppt,.xlsx,.xls,.csv,.doc,.docx,.txt";

export default function IdeaForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("mode");
  const [mode, setMode] = useState<Mode>("quick");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<string[]>([""]);
  const [form, setForm] = useState({
    reportName: "",
    searchTopic: "",
    depth: "STANDARD" as Depth,
    // Guided fields for deep dive
    problem: "",
    icp: "",
    competitors: "",
    pricing: "",
    founders: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files || []);
    const validFiles = newFiles.filter((f) => f.size <= MAX_FILE_SIZE);
    setFiles((prev) => [...prev, ...validFiles].slice(0, MAX_FILES));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleLinkChange(index: number, value: string) {
    setLinks((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }

  function addLink() {
    if (links.length < 5) setLinks((prev) => [...prev, ""]);
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function selectMode(m: Mode) {
    setMode(m);
    setForm((prev) => ({
      ...prev,
      depth: m === "quick" ? "QUICK" : "DEEP",
    }));
    setStep("form");
  }

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    setStep("confirm");
  }

  function buildSearchTopic(): string {
    if (mode === "quick") return form.searchTopic;

    // For deep dive, combine the guided fields with the overview
    const parts = [form.searchTopic];
    if (form.problem) parts.push(`\n\nProblem being solved: ${form.problem}`);
    if (form.icp) parts.push(`\n\nIdeal customer profile: ${form.icp}`);
    if (form.competitors) parts.push(`\n\nKey competitors: ${form.competitors}`);
    if (form.pricing) parts.push(`\n\nPricing strategy: ${form.pricing}`);
    if (form.founders) parts.push(`\n\nFounders/team: ${form.founders}`);

    const validLinks = links.filter((l) => l.trim());
    if (validLinks.length > 0) {
      parts.push(`\n\nReference links: ${validLinks.join(", ")}`);
    }

    if (files.length > 0) {
      parts.push(`\n\n[${files.length} supporting file(s) attached]`);
    }

    return parts.join("");
  }

  async function handleConfirm() {
    setLoading(true);
    setError("");

    try {
      const searchTopic = buildSearchTopic();

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportName: form.reportName,
          searchTopic,
          depth: form.depth,
        }),
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
        {/* Step 1: Choose Mode */}
        {step === "mode" && (
          <motion.div
            key="mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <p className="text-center text-cream-300 font-body mb-6">
              How would you like to submit your idea?
            </p>

            <button
              onClick={() => selectMode("quick")}
              className="w-full text-left p-6 rounded-lg border border-gold-500/15 bg-navy-800 hover:border-gold-500/40 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-500">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-lg text-cream-100 group-hover:text-gold-500 transition-colors">
                    Quick Look
                  </h3>
                  <p className="text-cream-300/60 text-sm font-body mt-1">
                    Got a raw concept? Just describe your idea in a paragraph and Miles will evaluate it.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => selectMode("deep")}
              className="w-full text-left p-6 rounded-lg border border-gold-500/15 bg-navy-800 hover:border-gold-500/40 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-500">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                    <path d="M11 8v6M8 11h6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-lg text-cream-100 group-hover:text-gold-500 transition-colors">
                    Deep Dive
                  </h3>
                  <p className="text-cream-300/60 text-sm font-body mt-1">
                    Have a more developed concept? Answer guided prompts and attach supporting materials for a higher-fidelity assessment.
                  </p>
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {/* Step 2: The Form */}
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
            {/* Back to mode selection */}
            <button
              type="button"
              onClick={() => setStep("mode")}
              className="text-cream-300/60 text-sm font-body hover:text-cream-100 transition-colors flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {/* Mode badge */}
            <div className="inline-flex items-center gap-2 border border-gold-500/20 bg-gold-500/5 rounded-full px-4 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
              <span className="text-gold-500 text-xs tracking-[0.2em] uppercase font-body">
                {mode === "quick" ? "Quick Look" : "Deep Dive"}
              </span>
            </div>

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
                {mode === "quick" ? "Describe Your Startup Idea" : "Overview of Your Idea"}
              </label>
              <textarea
                id="searchTopic"
                name="searchTopic"
                required
                rows={mode === "quick" ? 5 : 3}
                value={form.searchTopic}
                onChange={handleChange}
                placeholder="Describe your startup concept — the problem, your solution, and who it's for..."
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Deep Dive guided prompts */}
            {mode === "deep" && (
              <div className="space-y-4 border-t border-gold-500/10 pt-5">
                <p className="text-gold-500 text-xs tracking-[0.2em] uppercase font-body">
                  Guided Prompts
                </p>
                <p className="text-cream-300/50 text-xs font-body -mt-2">
                  Fill in as many as you can — more context means a higher-fidelity assessment.
                </p>

                {GUIDED_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label
                      htmlFor={field.key}
                      className="block text-cream-200 text-sm font-body mb-1.5"
                    >
                      {field.label}
                    </label>
                    <textarea
                      id={field.key}
                      name={field.key}
                      rows={2}
                      value={form[field.key as keyof typeof form]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                ))}

                {/* Reference Links */}
                <div>
                  <label className="block text-cream-200 text-sm font-body mb-1.5">
                    Reference Links
                  </label>
                  <p className="text-cream-300/40 text-xs font-body mb-2">
                    Add links to relevant websites, articles, or competitor pages.
                  </p>
                  {links.map((link, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => handleLinkChange(i, e.target.value)}
                        placeholder="https://..."
                        className={`${inputClass} flex-1`}
                      />
                      {links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLink(i)}
                          className="text-cream-300/40 hover:text-red-400 transition-colors px-2"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  {links.length < 5 && (
                    <button
                      type="button"
                      onClick={addLink}
                      className="text-gold-500 text-xs font-body hover:text-gold-400 transition-colors"
                    >
                      + Add another link
                    </button>
                  )}
                </div>

                {/* File Uploads */}
                <div>
                  <label className="block text-cream-200 text-sm font-body mb-1.5">
                    Supporting Files
                  </label>
                  <p className="text-cream-300/40 text-xs font-body mb-2">
                    Upload pitch decks, spreadsheets, PDFs, or docs (max {MAX_FILES} files, 10MB each).
                  </p>

                  {files.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {files.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-navy-800 border border-gold-500/10 rounded-lg px-3 py-2"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-500 flex-shrink-0">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="text-cream-200 text-sm font-body truncate flex-1">
                            {file.name}
                          </span>
                          <span className="text-cream-300/40 text-xs font-body flex-shrink-0">
                            {(file.size / 1024 / 1024).toFixed(1)}MB
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="text-cream-300/40 hover:text-red-400 transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {files.length < MAX_FILES && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_TYPES}
                        multiple
                        onChange={handleFileAdd}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gold-500/15 rounded-lg py-4 text-center hover:border-gold-500/30 transition-colors group"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cream-300/30 group-hover:text-gold-500/60 transition-colors mx-auto mb-1">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="text-cream-300/40 text-xs font-body group-hover:text-cream-300/60 transition-colors">
                          Click to upload files
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

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

        {/* Step 3: Confirm */}
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
              <div className="flex items-center gap-2 mb-2">
                <p className="text-gold-500 text-xs tracking-[0.3em] uppercase font-body">
                  Confirm Your Submission
                </p>
                <span className="text-cream-300/30 text-xs font-body">
                  ({mode === "quick" ? "Quick Look" : "Deep Dive"})
                </span>
              </div>

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
                  {mode === "quick" ? "Startup Idea" : "Idea Overview"}
                </p>
                <p className="text-cream-100 font-body leading-relaxed">
                  {form.searchTopic}
                </p>
              </div>

              {mode === "deep" && (
                <>
                  {GUIDED_FIELDS.map((field) => {
                    const val = form[field.key as keyof typeof form];
                    if (!val) return null;
                    return (
                      <div key={field.key}>
                        <p className="text-cream-300 text-xs font-body uppercase tracking-wider mb-1">
                          {field.label}
                        </p>
                        <p className="text-cream-100 font-body leading-relaxed text-sm">
                          {val}
                        </p>
                      </div>
                    );
                  })}

                  {links.filter((l) => l.trim()).length > 0 && (
                    <div>
                      <p className="text-cream-300 text-xs font-body uppercase tracking-wider mb-1">
                        Reference Links
                      </p>
                      {links.filter((l) => l.trim()).map((link, i) => (
                        <p key={i} className="text-gold-500 font-body text-sm truncate">
                          {link}
                        </p>
                      ))}
                    </div>
                  )}

                  {files.length > 0 && (
                    <div>
                      <p className="text-cream-300 text-xs font-body uppercase tracking-wider mb-1">
                        Attached Files
                      </p>
                      {files.map((file, i) => (
                        <p key={i} className="text-cream-100 font-body text-sm">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
                        </p>
                      ))}
                    </div>
                  )}
                </>
              )}
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
