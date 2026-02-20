import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "2026 Cohort — Mudita Innovation Lab",
  description: "Vote on the ideas Mudita builds next. The top ideas become real companies.",
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {children}
    </div>
  );
}
