import { Leaf, Recycle, Trash2, Droplet, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";

const STATIONS = [
  { location: "East Plaza Area", type: "recycling" as const },
  { location: "Gate C Concourse", type: "recycling" as const },
  { location: "200 Club Level Entrance", type: "compost" as const },
  { location: "Lot K Direct Exit", type: "water" as const },
  { location: "South Plaza Walkway", type: "recycling" as const },
];

const stationConfig = {
  recycling: {
    label: "Recycling",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: <Recycle size={11} />,
  },
  compost: {
    label: "Compost",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    icon: <Trash2 size={11} />,
  },
  water: {
    label: "Water Refill",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    icon: <Droplet size={11} />,
  },
} as const;

export function SustainabilityWidget() {
  return (
    <Card variant="data" className="p-4 flex flex-col justify-between h-full">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 animate-pulse">
              <Leaf size={15} />
            </div>
            <h3 className="font-display text-h3 font-semibold text-text-primary">Sustainability</h3>
          </div>
        </div>

        <div className="mb-3.5 rounded-lg border border-white/[0.04] bg-[#0c1222]/30 p-2.5 flex gap-2">
          <Sparkles size={14} className="text-floodlight-200 shrink-0 mt-0.5" />
          <p className="font-ui text-[11px] text-text-secondary leading-relaxed">
            Taking the Meadowlands Rail from Secaucus reduces matchday carbon emissions by 60% compared to driving.
          </p>
        </div>

        <p className="mb-2 font-ui text-[10px] font-bold text-text-muted uppercase tracking-wider">
          Waste & Refill Stations
        </p>
        
        <div className="space-y-1.5">
          {STATIONS.map((s) => {
            const cfg = stationConfig[s.type];
            return (
              <div
                key={s.location}
                className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-[#0c1222]/40 px-3 py-2 transition-colors hover:bg-white/[0.02]"
              >
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
        <span>MetLife Stadium is LEED Gold certified</span>
        <span className="text-emerald-500 font-bold uppercase tracking-widest text-[9px]">Eco-Ops</span>
      </div>
    </Card>
  );
}
