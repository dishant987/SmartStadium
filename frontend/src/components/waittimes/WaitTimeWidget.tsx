import { useState, useEffect } from "react";
import { Clock, TrendingUp, TrendingDown, RefreshCw, Sparkles, MapPin } from "lucide-react";
import Markdown from "react-markdown";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/services/apiClient";
import { mdComponents } from "@/components/ui/markdownComponents";
import type { WaitTimeResponse } from "@/services/waitTimes";

const ZONES = [
  { id: "all", name: "All Zones" },
  { id: "z1", name: "Main Stand" },
  { id: "z2", name: "East Stand" },
  { id: "z3", name: "West Stand" },
  { id: "z4", name: "South Plaza" },
  { id: "z5", name: "Fan Zone" },
];

const MATCH_STATUSES = [
  { id: "pre_match", label: "Pre-match" },
  { id: "in_progress", label: "In progress" },
  { id: "halftime", label: "Halftime" },
  { id: "post_match", label: "Post-match" },
];

const statusConfig = {
  low: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
    label: "Short Queue",
  },
  moderate: {
    border: "border-l-amber-500",
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    dot: "bg-amber-500",
    label: "Moderate Queue",
  },
  high: {
    border: "border-l-rose-500",
    bg: "bg-rose-500/5",
    text: "text-rose-400",
    dot: "bg-rose-500",
    label: "Long Queue",
  },
} as const;

function TypeIcon(type: string) {
  if (type === "food") return <span className="text-sm">🍔</span>;
  if (type === "restroom") return <span className="text-sm">🚻</span>;
  return <span className="text-sm">🛍️</span>;
}

export function WaitTimeWidget() {
  const [zone, setZone] = useState("all");
  const [matchStatus, setMatchStatus] = useState("in_progress");
  const [matchMinute, setMatchMinute] = useState(34);
  const [data, setData] = useState<WaitTimeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPredict = async () => {
    setLoading(true);
    try {
      const result = await apiClient<WaitTimeResponse>("/ops/wait-times", {
        method: "POST",
        body: JSON.stringify({ zone, match_minute: matchMinute, match_status: matchStatus }),
      });
      setData(result);
    } catch {}
    setLoading(false);
  };

  // Automatically fetch predictions when parameters change for instant, real-time feel
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPredict();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [zone, matchStatus, matchMinute]);

  return (
    <Card variant="data" className="p-4 flex flex-col justify-between h-full">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Clock size={15} />
            </div>
            <h3 className="font-display text-h3 font-semibold text-text-primary">Wait Time Predictor</h3>
          </div>
          <Button size="sm" variant="ghost" onClick={fetchPredict} disabled={loading} className="h-7 w-7 p-0">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>

        {/* Input Parameters Controls */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Zone</label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full rounded-lg border border-white/[0.04] bg-[#0c1222]/60 px-2.5 py-1.5 font-ui text-xs text-text-primary outline-none focus:border-indigo-500/50"
            >
              {ZONES.map((z) => <option key={z.id} value={z.id} className="bg-pitch-night">{z.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Match Status</label>
            <select
              value={matchStatus}
              onChange={(e) => setMatchStatus(e.target.value)}
              className="w-full rounded-lg border border-white/[0.04] bg-[#0c1222]/60 px-2.5 py-1.5 font-ui text-xs text-text-primary outline-none focus:border-indigo-500/50"
            >
              {MATCH_STATUSES.map((s) => <option key={s.id} value={s.id} className="bg-pitch-night">{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-4 bg-[#0c1222]/20 border border-white/[0.02] p-2.5 rounded-lg">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Match Timeline</label>
            <span className="text-xs font-extrabold text-indigo-400 font-display">{matchMinute} min</span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            value={matchMinute}
            onChange={(e) => setMatchMinute(Number(e.target.value))}
            className="w-full accent-indigo-500 h-1 rounded-full bg-white/[0.06] cursor-pointer"
          />
        </div>

        {/* Dynamic Predictions Output */}
        <div className="space-y-2">
          {loading || !data ? (
            <div className="space-y-2 animate-pulse">
              <div className="rounded-lg border border-white/[0.04] bg-indigo-500/5 p-2.5 flex gap-2">
                <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                <Skeleton className="h-4 w-5/6 rounded" />
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-r-lg border-l-2 border-l-white/20 bg-white/[0.02] p-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-1">
                        <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                        <Skeleton className="h-4 w-1/3 rounded" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-16 rounded-full" />
                        <Skeleton className="h-4 w-6 rounded" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex gap-2">
                        <Skeleton className="h-3 w-14 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                      <Skeleton className="h-3 w-12 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {data.summary && (
                <div className="rounded-lg border border-white/[0.04] bg-indigo-500/5 p-2.5 flex gap-2 text-text-secondary">
                  <Sparkles size={13} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div className="font-ui text-[11px] leading-relaxed flex-1">
                    <Markdown components={mdComponents}>{data.summary}</Markdown>
                  </div>
                </div>
              )}
              
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {data.locations.map((loc) => {
                  const cfg = (loc.status in statusConfig)
                    ? statusConfig[loc.status as keyof typeof statusConfig]
                    : statusConfig.moderate;
                  return (
                    <div
                      key={loc.id}
                      className={`flex flex-col gap-1.5 rounded-r-lg border-l-2 ${cfg.border} ${cfg.bg} p-2.5 transition-colors hover:bg-white/[0.02]`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {TypeIcon(loc.type)}
                          <span className="font-ui text-xs font-semibold text-text-primary truncate">{loc.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-widest ${cfg.text}`}>
                            <span className={`h-1 w-1 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                          <span className="font-display text-xs font-extrabold text-text-primary shrink-0">
                            {loc.current_wait_min}m
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] text-text-muted mt-0.5">
                        <div className="flex items-center gap-2 font-ui">
                          <span className="flex items-center gap-0.5"><TrendingUp size={10} /> Halftime: {loc.predicted_wait_halftime_min}m</span>
                          <span className="flex items-center gap-0.5"><TrendingDown size={10} /> Post-match: {loc.predicted_wait_post_match_min}m</span>
                        </div>
                        <div className="flex items-center gap-0.5 font-ui text-[9px]">
                          <MapPin size={9} />
                          <span className="truncate max-w-[100px]">{loc.recommendation.split(" — ")[0] || "Near Gate"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] text-text-muted font-ui flex justify-between items-center">
        <span>Simulated ML Preds</span>
        <span className="text-indigo-400 font-bold uppercase tracking-widest text-[9px]">Predictive Engine</span>
      </div>
    </Card>
  );
}
