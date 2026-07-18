import type { ReactNode } from "react";

interface Props {
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
  children: ReactNode;
}

export function Badge({ variant = "default", className = "", children }: Props) {
  const base = "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 font-ui text-data font-medium";
  const variants = {
    default: "bg-pitch-raised text-text-secondary",
    success: "bg-pitch-green-600/20 text-pitch-green-400",
    warning: "bg-alert-orange/20 text-alert-orange",
    error: "bg-alert-red/20 text-alert-red",
  };
  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
