import { forwardRef, type InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className = "", ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="font-ui text-data-md text-text-secondary">{label}</label>}
    <input
      ref={ref}
      className={`rounded-fan border bg-pitch-night px-3 py-2 font-ui text-body text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-floodlight-200/50 focus:ring-1 focus:ring-floodlight-200/30 ${error ? "border-alert-red" : "border-border"} ${className}`}
      {...props}
    />
    {error && <span className="font-ui text-data text-alert-red">{error}</span>}
  </div>
));
Input.displayName = "Input";
