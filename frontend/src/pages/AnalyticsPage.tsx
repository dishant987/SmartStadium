import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, TrendingDown, Minus, Users, Zap, RefreshCw } from "lucide-react";
import Markdown from "react-markdown";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiClient } from "@/services/apiClient";
import { Navbar } from "@/components/navigation/Navbar";
import { mdComponents } from "@/components/ui/markdownComponents";
import type { PostMatchAnalyticsResponse } from "@/services/analytics";

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp size={14} className="text-rose-400" />;
  if (trend === "down") return <TrendingDown size={14} className="text-pitch-green-400" />;
  return <Minus size={14} className="text-text-muted" />;
}

function CrowdChart({ data }: { data: Array<{ minute: number; count: number }> }) {
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div className="flex items-end gap-1.5 h-36 pt-4 px-2">
      {data.map((d) => (
        <div key={d.minute} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
          <div 
            className="w-full rounded-t bg-gradient-to-t from-pitch-green-500/25 to-pitch-green-400 hover:from-floodlight-200/40 hover:to-floodlight-100 transition-all duration-300 relative group"
            style={{ height: `${(d.count / max) * 100}%` }}
          >
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 hidden group-hover:block bg-pitch-night/95 border border-white/[0.08] backdrop-blur-md rounded-data px-2 py-0.5 text-[10px] text-text-primary font-semibold whitespace-nowrap z-10 shadow-modal">
              {d.count.toLocaleString()}
            </div>
          </div>
          <span className="text-[9px] font-semibold text-text-muted">{d.minute}'</span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsPage() {
  const [data, setData] = useState<PostMatchAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await apiClient<PostMatchAnalyticsResponse>("/analytics/post-match");
      setData(res);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div className="min-h-screen bg-pitch-night text-text-primary font-ui relative overflow-x-hidden">
      {/* Global Navbar */}
      <Navbar />

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-10" />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-pitch-green-500/[0.03] blur-[80px]" />

      <div className="mx-auto max-w-6xl px-6 pt-24 pb-16 relative z-10">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between border-b border-white/[0.05] pb-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-fan bg-pitch-green-500/10 text-pitch-green-400">
                <BarChart3 size={14} />
              </span>
              Post-Match Analytics
            </h1>
            <p className="text-body text-text-secondary mt-1">AI-generated operational summaries and crowd efficiency metrics</p>
          </div>
          <Button size="sm" variant="ghost" onClick={fetch} disabled={loading} className="border border-white/[0.06] bg-white/[0.02]">
            <RefreshCw size={14} className={loading ? "animate-spin mr-1.5" : "mr-1.5"} /> Refresh Stats
          </Button>
        </div>

        {loading && (
          <div className="space-y-6 animate-pulse">
            {/* Match Header Info Skeleton */}
            <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-1/3 rounded" />
                <Skeleton className="h-4 w-1/4 rounded" />
              </div>
              <Skeleton className="h-6 w-24 rounded-pill" />
            </div>

            {/* Metrics cards grid Skeleton */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card p-4 rounded-fan border border-white/[0.08] shadow-data flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-16 rounded" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <Skeleton className="h-6 w-12 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Crowd Timeline Chart Skeleton */}
            <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-48 rounded" />
              </div>
              <div className="flex items-end gap-1.5 h-36 pt-4 px-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                  <Skeleton key={i} className="flex-1 rounded-t bg-pitch-raised/50" style={{ height: `${(i % 3) * 20 + 30}%` }} />
                ))}
              </div>
            </div>

            {/* Gate Performance Table Skeleton */}
            <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-48 rounded" />
              </div>
              <div className="space-y-3.5">
                <div className="flex justify-between border-b border-white/[0.06] pb-2">
                  <Skeleton className="h-4 w-1/5 rounded" />
                  <Skeleton className="h-4 w-1/6 rounded" />
                  <Skeleton className="h-4 w-1/6 rounded" />
                  <Skeleton className="h-4 w-1/6 rounded" />
                  <Skeleton className="h-4 w-1/6 rounded" />
                </div>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-white/[0.03] last:border-0">
                    <Skeleton className="h-4 w-1/6 rounded" />
                    <Skeleton className="h-4 w-12 rounded" />
                    <Skeleton className="h-4 w-10 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* AI narratives blocks Skeleton */}
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data space-y-2">
                  <Skeleton className="h-4 w-1/2 rounded" />
                  <div className="space-y-1.5 pt-2">
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-5/6 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Recommendations Skeleton */}
            <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-48 rounded" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3.5 rounded-data bg-white/[0.02] border border-white/[0.04] p-4">
                    <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3 w-full rounded" />
                      <Skeleton className="h-3 w-3/4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6 animate-float">
            {/* Match Header Info */}
            <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-text-primary">{data.match_name}</h2>
                <p className="text-data text-text-muted mt-0.5">{data.date} • MetLife Stadium Venue</p>
              </div>
              <Badge variant="success" className="bg-pitch-green-500/10 border border-pitch-green-500/30 text-pitch-green-400">Match Completed</Badge>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {data.metrics.map((m) => (
                <div key={m.label} className="glass-card p-4 rounded-fan border border-white/[0.08] shadow-data flex flex-col justify-between hover:border-white/15 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-data text-text-muted truncate mr-1">{m.label}</span>
                    <TrendIcon trend={m.trend} />
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold text-text-primary tracking-tight">{m.value}</div>
                    <p className="mt-0.5 text-[11px] text-text-secondary">{m.change} vs baseline</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Crowd Timeline Chart */}
            <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data">
              <h3 className="mb-4 font-display text-body-lg font-bold text-text-primary flex items-center gap-2">
                <Users size={16} className="text-floodlight-200" />
                Stadium Occupancy Timeline
              </h3>
              <CrowdChart data={data.crowd_timeline} />
            </div>

            {/* Gate Performance Table */}
            <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data">
              <h3 className="mb-4 font-display text-body-lg font-bold text-text-primary flex items-center gap-2">
                <BarChart3 size={16} className="text-floodlight-200" />
                Gate Flow &amp; Response Times
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-data-md">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-text-muted font-medium">
                      <th className="pb-3 text-left">Access Gate</th>
                      <th className="pb-3 text-right">Peak Capacity Density</th>
                      <th className="pb-3 text-right">Peak Match Minute</th>
                      <th className="pb-3 text-right">Total Evacuated</th>
                      <th className="pb-3 text-right">Avg Checkpoint Wait</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {data.gate_stats.map((g) => (
                      <tr key={g.gate} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 text-text-primary font-semibold">{g.gate}</td>
                        <td className="py-3 text-right">
                          <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            g.peak_density > 0.9 
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                              : g.peak_density > 0.8 
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/20" 
                                : "bg-pitch-green-500/10 text-pitch-green-400 border border-pitch-green-500/20"
                          }`}>
                            {(g.peak_density * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 text-right text-text-secondary">{g.peak_minute}'</td>
                        <td className="py-3 text-right text-text-secondary">{g.total_evacuated.toLocaleString()}</td>
                        <td className="py-3 text-right text-text-secondary font-medium">{g.avg_wait_min} min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI narratives blocks */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data">
                <h3 className="mb-2.5 font-display text-body-lg font-bold text-text-primary flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-pitch-green-400" /> Executive Operations Summary
                </h3>
                <div className="text-body text-text-secondary leading-relaxed">
                  <Markdown components={mdComponents}>{data.narrative.executive_summary}</Markdown>
                </div>
              </div>
              <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data">
                <h3 className="mb-2.5 font-display text-body-lg font-bold text-text-primary flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Crowd Movement Analysis
                </h3>
                <div className="text-body text-text-secondary leading-relaxed">
                  <Markdown components={mdComponents}>{data.narrative.crowd_analysis}</Markdown>
                </div>
              </div>
              <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data">
                <h3 className="mb-2.5 font-display text-body-lg font-bold text-text-primary flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Gate Performance &amp; Delays
                </h3>
                <div className="text-body text-text-secondary leading-relaxed">
                  <Markdown components={mdComponents}>{data.narrative.gate_performance}</Markdown>
                </div>
              </div>
              <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data">
                <h3 className="mb-2.5 font-display text-body-lg font-bold text-text-primary flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" /> Public Transit &amp; Rail Impact
                </h3>
                <div className="text-body text-text-secondary leading-relaxed">
                  <Markdown components={mdComponents}>{data.narrative.transit_impact}</Markdown>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data">
              <h3 className="mb-4 font-display text-body-lg font-bold text-text-primary flex items-center gap-2">
                <Zap size={16} className="text-floodlight-200" />
                AI-Suggested Optimizations
              </h3>
              <div className="space-y-3">
                {data.narrative.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3.5 rounded-data bg-white/[0.02] border border-white/[0.04] p-4 hover:bg-white/[0.04] transition-colors">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-floodlight-200/10 text-floodlight-200 text-data font-bold">{i + 1}</span>
                    <div className="text-body text-text-secondary leading-relaxed flex-1">
                      <Markdown components={mdComponents}>{rec}</Markdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
