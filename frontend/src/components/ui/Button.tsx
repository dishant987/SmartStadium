import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Spinner } from "./Spinner";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

export function Button({ variant = "primary", size = "md", loading, children, className = "", disabled, ...props }: Props) {
  const base = "inline-flex items-center justify-center gap-2 font-ui font-medium transition-all focus:outline-none focus:ring-2 focus:ring-floodlight-200/50 disabled:opacity-50 disabled:pointer-events-none";
  const sizes = {
    sm: "px-3 py-1.5 text-data-md rounded-data",
    md: "px-4 py-2 text-body rounded-fan",
    lg: "px-6 py-3 text-body-lg rounded-fan",
  };
  const variants = {
    primary: "bg-floodlight-200 text-pitch-night hover:bg-floodlight-100 active:bg-floodlight-300",
    secondary: "border border-border bg-transparent text-text-primary hover:bg-pitch-raised",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-pitch-raised",
    destructive: "bg-alert-red text-white hover:bg-red-600",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
