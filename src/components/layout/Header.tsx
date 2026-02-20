"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

export default function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isLoggedIn = !!session?.user;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy-950/80 backdrop-blur-md border-b border-gold-500/10">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="font-display text-xl text-cream-100 tracking-wide">
            Miles
          </span>
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold-500 font-body mt-1">
            by Mudita
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {isLoggedIn ? (
            <>
              <a
                href="/dashboard"
                className="text-sm text-cream-300 hover:text-cream-100 transition-colors font-body"
              >
                My Reports
              </a>
              <a
                href="/submit"
                className="text-sm text-cream-300 hover:text-cream-100 transition-colors font-body"
              >
                New Report
              </a>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm text-cream-300 hover:text-cream-100 transition-colors font-body"
                >
                  <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                    <span className="text-gold-500 text-xs font-body">
                      {session.user.name?.[0]?.toUpperCase() ||
                        session.user.email?.[0]?.toUpperCase() ||
                        "U"}
                    </span>
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 5l3 3 3-3" />
                  </svg>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-navy-800 border border-gold-500/15 rounded-lg overflow-hidden shadow-lg"
                    >
                      <div className="px-4 py-3 border-b border-gold-500/10">
                        <p className="text-cream-100 text-sm font-body truncate">
                          {session.user.name || "User"}
                        </p>
                        <p className="text-cream-300/50 text-xs font-body truncate">
                          {session.user.email}
                        </p>
                      </div>
                      <a
                        href="/team"
                        className="block px-4 py-2.5 text-sm text-cream-300 hover:bg-gold-500/10 hover:text-cream-100 transition-colors font-body"
                      >
                        Team Workspaces
                      </a>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left px-4 py-2.5 text-sm text-cream-300 hover:bg-gold-500/10 hover:text-cream-100 transition-colors font-body"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <a
                href="/studios"
                className="text-xs tracking-widest uppercase font-body px-3 py-1.5 rounded-full border border-gold-500/40 text-gold-500 hover:border-gold-500 hover:text-gold-400 transition-colors"
              >
                Mudita Studios
              </a>
              <a
                href="/lab"
                className="flex items-center gap-1.5 text-xs tracking-widest uppercase font-body px-3 py-1.5 rounded-full border border-orange-500/40 text-orange-400 hover:border-orange-400 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                2026 Cohort
              </a>
              <a
                href="/#how-it-works"
                className="text-sm text-cream-300 hover:text-cream-100 transition-colors font-body"
              >
                How It Works
              </a>
              <a
                href="/#dimensions"
                className="text-sm text-cream-300 hover:text-cream-100 transition-colors font-body"
              >
                Dimensions
              </a>
              <a
                href="/#faq"
                className="text-sm text-cream-300 hover:text-cream-100 transition-colors font-body"
              >
                FAQ
              </a>
              <Button href="/login" size="md" variant="outline">
                Sign In
              </Button>
              <Button href="/submit" size="md" variant="filled">
                Validate Your Idea
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-cream-100 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {mobileOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-navy-900 border-b border-gold-500/10 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {isLoggedIn ? (
                <>
                  <a
                    href="/dashboard"
                    className="text-sm text-cream-300 hover:text-cream-100 transition-colors font-body"
                    onClick={() => setMobileOpen(false)}
                  >
                    My Reports
                  </a>
                  <a
                    href="/submit"
                    className="text-sm text-cream-300 hover:text-cream-100 transition-colors font-body"
                    onClick={() => setMobileOpen(false)}
                  >
                    New Report
                  </a>
                  <a
                    href="/team"
                    className="text-sm text-cream-300 hover:text-cream-100 transition-colors font-body"
                    onClick={() => setMobileOpen(false)}
                  >
                    Team Workspaces
                  </a>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="text-sm text-cream-300 hover:text-cream-100 transition-colors font-body text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/studios"
                    className="text-xs tracking-widest uppercase font-body px-3 py-1.5 rounded-full border border-gold-500/40 text-gold-500 self-start"
                    onClick={() => setMobileOpen(false)}
                  >
                    Mudita Studios
                  </a>
                  <a
                    href={"/lab"}
                    className="flex items-center gap-1.5 text-xs tracking-widest uppercase font-body px-3 py-1.5 rounded-full border border-orange-500/40 text-orange-400 self-start"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    2026 Cohort
                  </a>
                  <a
                    href="/#how-it-works"
                    className="text-sm text-cream-300 hover:text-cream-100 transition-colors font-body"
                    onClick={() => setMobileOpen(false)}
                  >
                    How It Works
                  </a>
                  <a
                    href="/#dimensions"
                    className="text-sm text-cream-300 hover:text-cream-100 transition-colors font-body"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dimensions
                  </a>
                  <a
                    href="/#faq"
                    className="text-sm text-cream-300 hover:text-cream-100 transition-colors font-body"
                    onClick={() => setMobileOpen(false)}
                  >
                    FAQ
                  </a>
                  <Button href="/login" size="md" variant="outline">
                    Sign In
                  </Button>
                  <Button href="/submit" size="md" variant="filled">
                    Validate Your Idea
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
