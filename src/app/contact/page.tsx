"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const inputClass =
    "w-full bg-navy-800 border border-gold-500/15 rounded-sm px-4 py-3 text-cream-100 font-body placeholder:text-cream-300/30 focus:outline-none focus:border-gold-500/50 focus:shadow-[0_0_15px_rgba(201,168,76,0.1)] transition-all";

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-4xl text-cream-100 mb-3">
            Get in Touch
          </h1>
          <p className="text-cream-300/60 font-body text-sm">
            Have a question, feedback, or partnership inquiry? We&apos;d love to hear from you.
          </p>
        </div>

        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-navy-800/50 border border-gold-500/20 rounded-lg p-8 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="font-display text-xl text-cream-100 mb-2">Message Sent</h2>
            <p className="text-cream-300/60 font-body text-sm">
              Thanks for reaching out. We&apos;ll get back to you soon.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm text-cream-300/80 font-body mb-1.5">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-cream-300/80 font-body mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm text-cream-300/80 font-body mb-1.5">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help?"
                className={`${inputClass} resize-none`}
              />
            </div>

            {errorMsg && (
              <p className="text-red-400 text-sm font-body">{errorMsg}</p>
            )}

            <Button
              type="submit"
              variant="filled"
              size="lg"
              loading={status === "loading"}
              disabled={status === "loading"}
              className="w-full"
            >
              Send Message
            </Button>
          </form>
        )}
      </motion.div>
    </section>
  );
}
