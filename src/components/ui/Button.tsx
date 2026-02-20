"use client";

import { motion } from "framer-motion";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "filled" | "outline";
  size?: "md" | "lg";
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function Button({
  children,
  variant = "filled",
  size = "md",
  href,
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-body font-semibold tracking-wide rounded-sm transition-all duration-300 cursor-pointer";

  const sizes = {
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const variants = {
    filled:
      "bg-gold-500 text-navy-950 hover:bg-gold-300 shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_30px_rgba(201,168,76,0.5)]",
    outline:
      "border border-gold-500 text-gold-500 hover:bg-gold-500/10 hover:shadow-[0_0_20px_rgba(201,168,76,0.15)]",
  };

  const classes = `${base} ${sizes[size]} ${variants[variant]} ${
    disabled || loading ? "opacity-50 cursor-not-allowed" : ""
  } ${className}`;

  const content = loading ? (
    <span className="flex items-center gap-2">
      <svg
        className="animate-spin h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {children}
    </span>
  ) : (
    children
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={classes}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {content}
    </motion.button>
  );
}
