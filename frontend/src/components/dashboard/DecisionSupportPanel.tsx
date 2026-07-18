import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useRecommendations } from "@/hooks/useRecommendations";
import { Skeleton } from "@/components/ui/Skeleton";

const priorityConfig = {
  high: {
    border: "border-l-rose-500",
    bg: "bg-rose-500/5",
    text: "text-rose-400",
    label: "High Priority",
  },
  medium: {
    border: "border-l-amber-500",
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    label: "Medium Priority",
  },
  low: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    label: "Normal",
  },
} as const;

export function DecisionSupportPanel() {
  const { data, isLoading } = useRecommendations();

  return (
    <Card variant="data" className="p-4 flex flex-col justify-between h-full">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Lightbulb size={15} />
            </div>
            <h3 className="font-display text-h3 font-semibold text-text-primary">Recommended Actions</h3>
          </div>
        </div>

        <div className="space-y-2.5">
          {isLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)
          ) : !data || data.length === 0 ? (
            <p className="py-8 text-center font-ui text-data text-text-muted">No pending recommendations</p>
          ) : (
            data.map((r) => {
              const config = priorityConfig[r.priority] || priorityConfig.low;
              return (
                <div
                  key={r.id}
                  className={`flex flex-col gap-1 rounded-r-lg border-l-2 ${config.border} ${config.bg} p-3 transition-colors hover:bg-white/[0.02]`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs font-bold text-text-primary tracking-tight">
                      {r.title}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${config.text}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="font-ui text-[12px] text-text-secondary leading-relaxed mt-0.5">
                    {r.description}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
        <span className="font-ui text-[10px] text-text-muted">
          LLM-generated from live incident + crowd data
        </span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>
    </Card>
  );
}
