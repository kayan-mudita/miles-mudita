"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import GoldGlow from "@/components/ui/GoldGlow";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create account");
      }

      // Auto sign-in after signup
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Account created but sign-in failed. Please log in.");
      }

      // Transfer any anonymous reports to the new account
      await fetch("/api/auth/claim-anonymous", { method: "POST" }).catch(() => {});

      // Redirect to callback URL if present, otherwise dashboard
      const params = new URLSearchParams(window.location.search);
      router.push(params.get("callbackUrl") || "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-navy-800 border border-gold-500/15 rounded-sm px-4 py-3 text-cream-100 font-body placeholder:text-cream-300/30 focus:outline-none focus:border-gold-500/50 focus:shadow-[0_0_15px_rgba(201,168,76,0.1)] transition-all";

  return (
    <section className="relative min-h-screen flex items-center justify-center py-16 overflow-hidden">
      <GoldGlow className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size="lg" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="text-center mb-8">
          <p className="text-gold-500 text-xs tracking-[0.3em] uppercase font-body mb-4">
            Free Account
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-cream-100 mb-3">
            Create Your Account
          </h1>
          <p className="text-cream-300 text-base md:text-lg font-body mb-6">
            Start validating your startup ideas
          </p>
          <div className="flex flex-col items-center gap-2 text-sm text-cream-300/70 font-body">
            <span>Save reports in one place</span>
            <span>Track progress in real time</span>
            <span>Compare ideas side by side</span>
          </div>
        </div>

        <div className="bg-navy-800 border border-gold-500/15 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-cream-200 text-sm font-body mb-1.5"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-cream-200 text-sm font-body mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-cream-200 text-sm font-body mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm font-body">{error}</p>
            )}

            <Button
              type="submit"
              variant="filled"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Create Free Account
            </Button>
          </form>
        </div>

        <p className="text-center text-cream-300/50 text-sm font-body mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-gold-500 hover:underline">
            Sign in
          </a>
        </p>
      </motion.div>
    </section>
  );
}
