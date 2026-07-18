import { useToast } from "@/context/ToastContext";

const iconMap: Record<string, string> = {
  success: "\u2713",
  error: "\u2717",
  warning: "\u26A0",
  info: "\u2139",
};

const colorMap: Record<string, string> = {
  success: "border-l-pitch-green-500",
  error: "border-l-alert-red",
  warning: "border-l-alert-orange",
  info: "border-l-floodlight-200",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-fan border border-border bg-pitch-surface px-4 py-3 shadow-toast border-l-4 ${colorMap[t.type || "info"]}`}
        >
          <span className="text-text-secondary">{iconMap[t.type || "info"]}</span>
          <span className="flex-1 font-ui text-body text-text-primary">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="text-text-muted hover:text-text-primary">&times;</button>
        </div>
      ))}
    </div>
  );
}
