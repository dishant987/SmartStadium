import { type ReactNode, type HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: "data" | "fan";
  children: ReactNode;
}

export function Card({ variant = "data", className = "", children, ...props }: Props) {
  const base = variant === "data"
    ? "rounded-data border border-border bg-pitch-surface p-4 shadow-data"
    : "rounded-fan border border-border bg-pitch-surface p-4 shadow-data";
  return (
    <div className={`${base} ${className}`} {...props}>
      {children}
    </div>
  );
}
