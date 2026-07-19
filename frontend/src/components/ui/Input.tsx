import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className = "", type, id: idProp, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;
  const inputId = idProp || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label htmlFor={inputId} className="font-ui text-data-md text-text-secondary">{label}</label>}
      <div className="relative w-full flex items-center">
        <input
          ref={ref}
          id={inputId}
          type={actualType}
          className={`rounded-fan border bg-pitch-night px-3 py-2 pr-10 font-ui text-body text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-floodlight-200/50 focus:ring-1 focus:ring-floodlight-200/30 ${
            error ? "border-alert-red" : "border-border"
          } ${className} w-full`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-text-muted hover:text-text-primary focus:outline-none transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="font-ui text-data text-alert-red">{error}</span>}
    </div>
  );
});
Input.displayName = "Input";
