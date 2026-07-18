import { useState } from "react";
import { Navigation, Accessibility, Clock, MapPin, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiClient } from "@/services/apiClient";
import { Navbar } from "@/components/navigation/Navbar";
import type { WayfindingRoute } from "@/services/wayfinding";

const ZONES = [
  { id: "z1", name: "Main Stand (100 Level)" },
  { id: "z2", name: "East Stand (200 Club)" },
  { id: "z3", name: "West Stand (300 Level)" },
  { id: "z4", name: "South Plaza" },
  { id: "z5", name: "Fan Zone" },
  { id: "z6", name: "Parking Lot A" },
];

export function WayfindingPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [accessible, setAccessible] = useState(false);
  const [wheelchair, setWheelchair] = useState(false);
  const [route, setRoute] = useState<WayfindingRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!from || !to) return;
    setLoading(true);
    setError("");
    try {
      const result = await apiClient<WayfindingRoute>("/nav/wayfinding", {
        method: "POST",
        body: JSON.stringify({ from_zone: from, to_zone: to, accessible, wheelchair, language: "en" }),
      });
      setRoute(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to find route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pitch-night text-text-primary font-ui relative overflow-x-hidden">
      {/* Global Navbar */}
      <Navbar />

      {/* Background Mesh Overlay */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-10" />

      {/* Ambient Glows */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-blue-500/[0.04] blur-[80px]" />

      <div className="mx-auto max-w-5xl px-6 pt-24 pb-16 relative z-10">
        {/* Page Header */}
        <div className="mb-8 border-b border-white/[0.05] pb-4">
          <h1 className="font-display text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-fan bg-blue-500/10 text-blue-400">
              <Navigation size={14} />
            </span>
            Smart Wayfinding
          </h1>
          <p className="text-body text-text-secondary mt-1">Step-by-step directions with full wheelchair and step-free support</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
          {/* Left: Search Input Card */}
          <div className="space-y-4">
            <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data">
              <h3 className="mb-4 font-display text-body-lg font-semibold text-text-primary flex items-center gap-2">
                <Navigation size={16} className="text-blue-400" />
                Find Your Route
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-data font-semibold text-text-muted uppercase tracking-wider">Start Position</label>
                  <select 
                    value={from} 
                    onChange={(e) => setFrom(e.target.value)} 
                    className="w-full rounded-data border border-white/[0.08] bg-pitch-night/80 px-3 py-2 text-body text-text-primary outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option value="">Select starting point…</option>
                    {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-data font-semibold text-text-muted uppercase tracking-wider">Destination</label>
                  <select 
                    value={to} 
                    onChange={(e) => setTo(e.target.value)} 
                    className="w-full rounded-data border border-white/[0.08] bg-pitch-night/80 px-3 py-2 text-body text-text-primary outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option value="">Select destination…</option>
                    {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAccessible(!accessible)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-data border px-3 py-1.5 text-data-md font-medium transition-all ${
                      accessible 
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30" 
                        : "bg-transparent text-text-secondary border-white/[0.08] hover:bg-white/[0.03]"
                    }`}
                  >
                    <Accessibility size={14} /> Step-free
                  </button>
                  <button 
                    onClick={() => setWheelchair(!wheelchair)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-data border px-3 py-1.5 text-data-md font-medium transition-all ${
                      wheelchair 
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30" 
                        : "bg-transparent text-text-secondary border-white/[0.08] hover:bg-white/[0.03]"
                    }`}
                  >
                    ♿ Wheelchair
                  </button>
                </div>

                <Button className="w-full shadow-[0_0_15px_rgba(59,130,246,0.2)]" onClick={handleSearch} disabled={!from || !to || loading}>
                  {loading ? <Spinner size="sm" /> : <Navigation size={14} />}
                  Get Directions
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data space-y-4 animate-pulse">
                <Skeleton className="h-5 w-1/3 rounded" />
                <div className="space-y-3.5 pt-2">
                  <div className="flex justify-between"><Skeleton className="h-4 w-1/3 rounded" /><Skeleton className="h-4 w-1/4 rounded" /></div>
                  <div className="flex justify-between"><Skeleton className="h-4 w-1/3 rounded" /><Skeleton className="h-4 w-1/4 rounded" /></div>
                  <div className="flex justify-between"><Skeleton className="h-4 w-1/3 rounded" /><Skeleton className="h-4 w-1/4 rounded" /></div>
                  <div className="flex justify-between border-t border-white/[0.04] pt-2.5 mt-2"><Skeleton className="h-4 w-1/3 rounded" /><Skeleton className="h-5 w-16 rounded-full" /></div>
                </div>
              </div>
            ) : route ? (
              <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data space-y-4">
                <h3 className="font-display text-body-lg font-semibold text-text-primary border-b border-white/[0.05] pb-2">
                  Route Summary
                </h3>
                <div className="space-y-2.5 text-data-md">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Total Distance</span>
                    <span className="text-text-primary font-semibold">{route.total_distance_m} meters</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Est. Travel Time</span>
                    <span className="text-text-primary font-semibold flex items-center gap-1"><Clock size={12} className="text-blue-400" /> {route.estimated_time_min} mins</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Navigation Steps</span>
                    <span className="text-text-primary font-semibold">{route.steps.length} checkpoints</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-2.5 mt-2">
                    <span className="text-text-muted">Route Style</span>
                    <Badge variant={route.accessible ? "success" : "default"}>
                      {route.accessible ? "Fully Accessible" : "Standard"}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Right: Step directions list */}
          <div className="space-y-4">
            {error && (
              <div className="rounded-fan border border-rose-500/20 bg-rose-500/10 p-4 text-body text-rose-400">
                {error}
              </div>
            )}

            {!route && !loading && (
              <div className="glass-card p-10 rounded-fan border border-white/[0.08] text-center shadow-data">
                <Navigation size={44} className="mx-auto mb-4 text-text-muted/30" />
                <h4 className="font-display text-body-lg font-semibold text-text-primary">No Route Selected</h4>
                <p className="mt-2 text-body text-text-secondary max-w-md mx-auto leading-relaxed">
                  Choose starting and ending stadium zones in the search panel. Smart route maps include stair-free access, elevator paths, and ramps.
                </p>
              </div>
            )}

            {loading && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-fan bg-white/[0.02] border border-white/[0.05] p-3 animate-pulse">
                  <Skeleton className="h-5 w-24 rounded" />
                  <ChevronRight size={14} className="text-text-muted animate-pulse" />
                  <Skeleton className="h-5 w-28 rounded" />
                </div>

                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-card p-4 rounded-fan border border-white/[0.06] shadow-data flex gap-4">
                      <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2.5">
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <div className="flex gap-2 pt-1">
                          <Skeleton className="h-4 w-12 rounded" />
                          <Skeleton className="h-4 w-16 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {route && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-fan bg-white/[0.02] border border-white/[0.05] p-3">
                  <span className="font-display text-body font-bold text-text-primary">{route.from_name}</span>
                  <ChevronRight size={14} className="text-text-muted" />
                  <span className="font-display text-body font-bold text-pitch-green-400">{route.to_name}</span>
                </div>

                <div className="space-y-3">
                  {route.steps.map((step) => (
                    <div key={step.step_number} className="glass-card p-4 rounded-fan border border-white/[0.06] shadow-data flex gap-4 hover:border-blue-500/25 transition-all">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 text-data font-bold">
                        {step.step_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body text-text-primary leading-relaxed font-medium">{step.instruction}</p>
                        <div className="mt-2.5 flex flex-wrap gap-2 text-data text-text-muted">
                          {step.distance_m > 0 && (
                            <span className="flex items-center gap-1 rounded bg-white/[0.03] px-1.5 py-0.5"><MapPin size={11} /> {step.distance_m}m</span>
                          )}
                          {step.level_change && (
                            <span className="flex items-center gap-1 rounded bg-white/[0.03] px-1.5 py-0.5">↕ Level: {step.level_change}</span>
                          )}
                          {step.landmark && (
                            <span className="text-floodlight-300 rounded bg-floodlight-200/5 px-1.5 py-0.5">Near: {step.landmark}</span>
                          )}
                        </div>
                        {step.accessibility_note && (
                          <div className="mt-2.5 rounded bg-pitch-green-500/10 border border-pitch-green-500/20 px-2.5 py-1 text-data font-medium text-pitch-green-400 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-pitch-green-400" />
                            <span>{step.accessibility_note}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {route.accessibility_summary && (
                  <div className="rounded-fan border border-pitch-green-500/20 bg-pitch-green-500/5 p-4">
                    <p className="text-data-md text-pitch-green-400 leading-relaxed font-medium">{route.accessibility_summary}</p>
                  </div>
                )}

                {route.wheelchair_alternative && (
                  <div className="rounded-fan border border-blue-500/20 bg-blue-500/5 p-4">
                    <p className="text-data-md text-blue-400 leading-relaxed font-medium">Wheelchair Alt: {route.wheelchair_alternative}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
