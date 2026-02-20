type GoldGlowProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

export default function GoldGlow({ className = "", size = "md" }: GoldGlowProps) {
  const sizes = {
    sm: "w-[300px] h-[300px]",
    md: "w-[500px] h-[500px]",
    lg: "w-[800px] h-[800px]",
  };

  return (
    <div
      className={`absolute rounded-full pointer-events-none gold-glow ${sizes[size]} ${className}`}
      aria-hidden="true"
    />
  );
}
