"use client";

import { useState } from "react";

export default function MaintenancePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/lab/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to join waitlist");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center space-y-8">
        {/* Gold accent line */}
        <div className="gold-rule mx-auto w-24" />

        <h1 className="font-display text-4xl md:text-5xl text-cream-100 leading-tight">
          Thanks so much for your interest in{" "}
          <span className="text-gold-gradient">Miles</span>!
        </h1>

        <p className="text-cream-300 text-lg md:text-xl leading-relaxed">
          Demand for Miles has exceeded our expectations and we are working
          on getting a better version of Miles to you ASAP.
        </p>

        <p className="text-cream-300 text-base">
          Sign up below to stay updated.
        </p>

        {!submitted ? (
          <div className="max-w-md mx-auto space-y-3">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-lg bg-navy-800 border border-navy-600 text-cream-100 placeholder:text-cream-300/50 focus:outline-none focus:border-gold-500 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-gold-500 text-navy-950 font-semibold hover:bg-gold-400 transition-colors whitespace-nowrap"
              >
                Notify Me
              </button>
            </form>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        ) : (
          <div className="px-6 py-4 rounded-lg border border-gold-500/30 bg-gold-500/10 max-w-md mx-auto">
            <p className="text-gold-400 font-medium">
              You're on the list! We'll let you know when Miles is back.
            </p>
          </div>
        )}

        <div className="gold-rule mx-auto w-24" />
      </div>
    </div>
  );
}
