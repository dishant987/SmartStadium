import { useEffect, useState } from "react";
import { Leaf, Recycle, Trash2, Droplet, Sparkles, Cpu, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { apiClient } from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";

interface PersonalizedTip {
  tip: string;
  context: string;
  impact: string;
  category: string;
}

const STATIONS = [
  { location: "East Plaza Area", type: "recycling" as const },
  { location: "Gate C Concourse", type: "recycling" as const },
  { location: "200 Club Level Entrance", type: "compost" as const },
  { location: "Lot K Direct Exit", type: "water" as const },
  { location: "South Plaza Walkway", type: "recycling" as const },
];

const stationConfig = {
  recycling: { label: "Recycling", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: <Recycle size={11} /> },
  compost: { label: "Compost", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: <Trash2 size={11} /> },
  water: { label: "Water Refill", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: <Droplet size={11} /> },
} as const;

export function SustainabilityWidget() {
  const { user } = useAuth();
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [personalized, setPersonalized] = useState<PersonalizedTip[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAiTip = async () => {
    setLoading(true);
    try {
      const tip = await apiClient<{ tip: string; source: string }>("/sustainability/tip?context=fan+at+main+stand");
      setAiTip(tip.tip);
    } catch {
      // ponytail: silent catch
    }
    setLoading(false);
  };

  const loadPersonalized = async () => {
    try {
      const tips = await apiClient<PersonalizedTip[]>("/sustainability/personalized-tips?zone=z1&match_status=in_progress");
      if (tips.length) setPersonalized(tips);
    } catch {
      // ponytail: silent catch
    }
  };

  useEffect(() => { loadAiTip(); if (user) loadPersonalized(); }, [user]);

  const categoryIcon = (cat: string) => {
    const icons: Record<string, React.ReactNode> = {
      transport: <Leaf size={12} />,
      waste: <Recycle size={12} />,
      energy: <Sparkles size={12} />,
      water: <Droplet size={12} />,
    };
    return icons[cat] || <Leaf size={12} />;
  };

  return (
    <Card variant="data" className="p-4 flex flex-col justify-between h-full">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Leaf size={15} />
            </div>
            <h3 className="font-display text-h3 font-semibold text-text-primary">Sustainability</h3>
          </div>
          <Badge variant="success" className="text-[9px]">AI-Powered</Badge>
        </div>

        {/* AI-Generated Tip */}
        <div className="mb-3 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] p-2.5 flex gap-2">
          <Cpu size={14} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            {loading ? (
              <div className="space-y-1.5 animate-pulse">
                <Skeleton className="h-3.5 w-full rounded bg-emerald-500/10" />
                <Skeleton className="h-3.5 w-2/3 rounded bg-emerald-500/10" />
              </div>
            ) : (
              <p className="font-ui text-[11px] text-text-secondary leading-relaxed">
                {aiTip || "Taking the Meadowlands Rail reduces matchday carbon emissions by 60% compared to driving."}
              </p>
            )}
            <button onClick={loadAiTip} className="mt-1 text-[9px] text-emerald-500/70 hover:text-emerald-400 flex items-center gap-1 transition-colors">
              <RefreshCw size={10} /> New tip
            </button>
          </div>
        </div>

        {/* Personalized Tips (auth only) */}
        {personalized.length > 0 && (
          <div className="mb-3 space-y-1.5">
            <p className="font-ui text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} /> AI Recommendations for You
            </p>
            {personalized.slice(0, 2).map((t, i) => (
              <div key={i} className="rounded-lg border border-white/[0.04] bg-[#0c1222]/40 p-2">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400/70 mt-0.5">{categoryIcon(t.category)}</span>
                  <div>
                    <p className="font-ui text-[11px] text-text-primary font-medium">{t.tip}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{t.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mb-2 font-ui text-[10px] font-bold text-text-muted uppercase tracking-wider">
          Waste & Refill Stations
        </p>
        <div className="space-y-1.5">
          {STATIONS.map((s) => {
            const cfg = stationConfig[s.type];
            return (
              <div key={s.location} className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-[#0c1222]/40 px-3 py-2 transition-colors hover:bg-white/[0.02]">
                <span className="font-ui text-xs font-semibold text-text-primary">{s.location}</span>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${cfg.color}`}>
                  {cfg.icon}
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] text-text-muted font-ui flex justify-between items-center">
        <span>MetLife Stadium LEED Gold</span>
        <span className="text-emerald-500 font-bold uppercase tracking-widest text-[9px]">AI Eco-Ops</span>
      </div>
    </Card>
  );
}
