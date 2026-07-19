import { memo } from "react";
import { useCrowdDensity } from "@/hooks/useCrowdDensity";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Activity } from "lucide-react";

export const CrowdDensityWidget = memo(function CrowdDensityWidget() {
  const { data, isLoading } = useCrowdDensity();

  return (
    <Card variant="data" className="p-4 flex flex-col justify-between h-full">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pitch-green-500/10 text-pitch-green-400">
              <Activity size={15} />
            </div>
            <h3 className="font-display text-h3 font-semibold text-text-primary">Crowd Density</h3>
          </div>
          <span className="text-[10px] font-semibold text-pitch-green-400 uppercase tracking-widest bg-pitch-green-500/10 px-2 py-0.5 rounded-full">
            Live telemetry
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {data?.map((z) => {
              // Handle decimals vs percentages gracefully
              const pct = z.density <= 1 ? Math.round(z.density * 100) : Math.round(z.density);
              
              let dotColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
              let barColor = "bg-emerald-500";
              let textColor = "text-emerald-400";
              
              if (pct >= 80) {
                dotColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]";
                barColor = "bg-rose-500";
                textColor = "text-rose-400";
              } else if (pct >= 60) {
                dotColor = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]";
                barColor = "bg-amber-500";
                textColor = "text-amber-400";
              }

              return (
                <div
                  key={z.id}
                  className="flex flex-col justify-between rounded-xl border border-white/[0.04] bg-[#0c1222]/40 p-3 hover:bg-[#0c1222]/80 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />
                      <span className="font-ui text-data-sm font-semibold text-text-primary truncate">{z.name}</span>
                    </div>
                    <span className={`font-display text-data-sm font-extrabold ${textColor} shrink-0 ml-1`}>
                      {pct}%
                    </span>
                  </div>
                  
                  <div className="mt-3.5 flex items-center justify-between gap-3">
                    <span className="font-ui text-[10px] font-medium text-text-muted">
                      {z.capacity.toLocaleString()} max
                    </span>
                    <div className="h-1 w-14 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] text-text-muted font-ui">
        Updated every 10 seconds
      </div>
    </Card>
  );
});
