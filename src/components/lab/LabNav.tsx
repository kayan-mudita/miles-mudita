"use client";

export function LabNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#080808]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a
          href="/studios"
          className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-white/40 hover:text-white/70 transition-colors font-medium"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2L4 7l5 5" />
          </svg>
          Mudita Studios
        </a>

        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-xs tracking-[0.3em] uppercase text-orange-400 font-semibold">
            2026 Cohort
          </span>
        </div>

        <a
          href="/"
          className="text-xs tracking-[0.2em] uppercase text-white/40 hover:text-white/70 transition-colors font-medium flex items-center gap-2"
        >
          Miles
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 2h7v7M12 2L2 12" />
          </svg>
        </a>
      </div>
    </nav>
  );
}
