import GrainOverlay from "@/components/ui/GrainOverlay";

export default function MockupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy-950 text-cream-100 font-body">
      <GrainOverlay />
      {children}
    </div>
  );
}
