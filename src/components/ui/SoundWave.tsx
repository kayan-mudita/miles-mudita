"use client";

import { useState, useEffect } from "react";

const DETERMINISTIC_DURATIONS = Array.from({ length: 24 }, () => 1.3);

export default function SoundWave({ className = "" }: { className?: string }) {
  const [durations, setDurations] = useState(DETERMINISTIC_DURATIONS);

  useEffect(() => {
    setDurations(Array.from({ length: 24 }, () => 1 + Math.random() * 0.6));
  }, []);

  return (
    <div className={`flex items-center justify-center gap-[3px] py-8 ${className}`} aria-hidden="true">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="w-[2px] bg-gold-500/20 rounded-full sound-bar"
          style={{
            height: "8px",
            animationDelay: `${i * 0.08}s`,
            animationDuration: `${durations[i]}s`,
          }}
        />
      ))}
    </div>
  );
}
