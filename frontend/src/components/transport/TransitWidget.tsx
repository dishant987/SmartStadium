import { Train, ShieldAlert, Bus, Route } from "lucide-react";
import { useTransport } from "@/hooks/useTransport";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

const statusConfig = {
  normal: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-500",
    label: "On Time",
  },
  delayed: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    dot: "bg-amber-500",
    label: "Delayed",
  },
  disrupted: {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    dot: "bg-rose-500",
    label: "Suspended",
  },
} as const;

export function TransitWidget() {
  const { data, isLoading } = useTransport();

  return (
    <Card variant="data" className="p-4 flex flex-col justify-between h-full">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Train size={15} />
            </div>
            <h3 className="font-display text-h3 font-semibold text-text-primary">Transit Status</h3>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {data?.lines.map((line) => {
              const status = (line.status || "normal") as keyof typeof statusConfig;
              const cfg = statusConfig[status] || statusConfig.normal;
              const isBus = line.name.toLowerCase().includes("shuttle") || line.name.toLowerCase().includes("bus");

              return (
                <div
                  key={line.id}
                  className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-[#0c1222]/40 px-3 py-2.5 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.03] text-text-secondary">
                      {isBus ? <Bus size={14} /> : <Train size={14} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-ui text-xs font-semibold text-text-primary truncate">{line.name}</span>
                      <span className="font-ui text-[10px] text-text-muted mt-0.5">{line.mode}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {line.delay_minutes > 0 && (
                      <span className="font-display text-[10px] font-bold text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                        +{line.delay_minutes}m delay
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                      <span className={`h-1 w-1 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04] rounded-lg bg-[#0c1222]/20 p-2.5 flex items-start gap-2">
        <Route size={14} className="text-floodlight-200 mt-0.5 shrink-0" />
        <div className="flex flex-col gap-0.5">
          <span className="font-ui text-[10px] font-bold text-text-primary">Ops Dispatch Advice</span>
          <span className="font-ui text-[10px] text-text-secondary leading-relaxed">
            Wait 15 min at seat after final whistle, then exit via Gate C for direct rail transfers.
          </span>
        </div>
      </div>
    </Card>
  );
}
