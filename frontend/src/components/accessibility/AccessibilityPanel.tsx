import { useEffect, useState } from "react";
import { Accessibility, Eye, Type, AlertTriangle, Cpu, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/services/apiClient";

interface ElevatorStatus {
  elevator_id: string;
  elevator_name: string;
  status: string;
  note: string;
}

interface AccessibilityRoute {
  from_name: string;
  to_name: string;
  steps: { step_number: number; instruction: string; distance_m: number; accessibility_note: string; warning: string }[];
  total_distance_m: number;
  estimated_time_min: number;
  ai_summary: string;
  warnings: string[];
}

interface Props {
  accessibleMode: boolean;
  onToggle: () => void;
  largeText: boolean;
  onToggleText: () => void;
}

const AMENITIES = [
  { label: "Wheelchair ramps at all gates", location: "Gates A–F" },
  { label: "Accessible seating", location: "Sections 115, 218, 320" },
  { label: "Elevators", location: "North Lobby, Gate D, 200 Club" },
  { label: "Accessible restrooms", location: "Every concourse level" },
  { label: "Assistive listening devices", location: "Info Desk, Gate A" },
  { label: "Service animal relief area", location: "East Plaza, Lot J" },
];

export function AccessibilityPanel({ accessibleMode, onToggle, largeText, onToggleText }: Props) {
  const [elevators, setElevators] = useState<ElevatorStatus[]>([]);
  const [aiRoute, setAiRoute] = useState<AccessibilityRoute | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const loadElevatorStatus = async () => {
    try {
      const data = await apiClient<ElevatorStatus[]>("/accessibility/status");
      setElevators(data);
    } catch { /* ignore */ }
  };

  const loadAiRoute = async () => {
    setLoadingRoute(true);
    try {
      const data = await apiClient<AccessibilityRoute>("/accessibility/ai-route", {
        method: "POST",
        body: JSON.stringify({ from_zone: "z6", to_zone: "z1", wheelchair: true, avoid_crowds: true }),
      });
      setAiRoute(data);
    } catch { /* ignore */ }
    setLoadingRoute(false);
  };

  useEffect(() => { loadElevatorStatus(); }, []);

  const hasIssues = elevators.some((e) => e.status !== "operational");

  return (
    <Card variant="data" className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Accessibility size={16} className="text-floodlight-200" />
          <h3 className="font-display text-h3 font-semibold text-text-primary">Accessibility</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant={hasIssues ? "warning" : "success"} className="text-[9px]">
            {hasIssues ? `${elevators.filter((e) => e.status !== "operational").length} issue(s)` : "All Clear"}
          </Badge>
          <Badge variant="success" className="text-[9px]">AI</Badge>
        </div>
      </div>

      <div className="mb-3 flex gap-2">
        <Button size="sm" variant={accessibleMode ? "primary" : "secondary"} onClick={onToggle}>
          <Accessibility size={14} /> Routes
        </Button>
        <Button size="sm" variant={largeText ? "primary" : "secondary"} onClick={onToggleText}>
          <Type size={14} /> Text
        </Button>
        <Button size="sm" variant="secondary" onClick={loadElevatorStatus}>
          <RefreshCw size={12} />
        </Button>
      </div>

      {/* Real-time elevator status */}
      {elevators.length > 0 && (
        <div className="mb-3 space-y-1">
          <p className="font-ui text-[10px] font-bold text-text-muted uppercase tracking-wider">Live Elevator Status</p>
          {elevators.slice(0, 3).map((e) => (
            <div key={e.elevator_id} className="flex items-center justify-between rounded-data bg-pitch-raised px-2.5 py-1.5">
              <span className={`font-ui text-data ${largeText ? "text-body" : ""} text-text-primary`}>{e.elevator_name}</span>
              <Badge variant={e.status === "operational" ? "success" : "warning"}>
                {e.status === "operational" ? "OK" : "Out"}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* AI Route Summary */}
      {aiRoute && (
        <div className="mb-3 rounded-lg border border-blue-500/15 bg-blue-500/[0.04] p-2.5">
          <div className="flex items-start gap-2">
            <Cpu size={14} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-ui text-[11px] text-text-secondary leading-relaxed">{aiRoute.ai_summary}</p>
              {aiRoute.warnings.filter((w) => w !== "All accessibility infrastructure operational").length > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  {aiRoute.warnings.filter((w) => w !== "All accessibility infrastructure operational").map((w, i) => (
                    <p key={i} className="text-[10px] text-amber-400 flex items-center gap-1"><AlertTriangle size={10} /> {w}</p>
                  ))}
                </div>
              )}
              <p className="text-[9px] text-text-muted mt-1">{aiRoute.total_distance_m}m · {aiRoute.estimated_time_min} min</p>
            </div>
          </div>
        </div>
      )}

      <p className="mb-2 font-ui text-data text-text-muted">Accessible amenities at MetLife Stadium:</p>
      <div className="space-y-1.5">
        {AMENITIES.map((a) => (
          <div key={a.label} className="flex items-center justify-between rounded-data bg-pitch-raised px-2.5 py-1.5">
            <span className={`font-ui ${largeText ? "text-body" : "text-data"} text-text-primary`}>{a.label}</span>
            <Badge>{a.location}</Badge>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="font-ui text-data text-text-muted">{largeText ? "Simplified language mode active" : "Ask AI for custom directions"}</p>
        {!aiRoute && !loadingRoute && (
          <button onClick={loadAiRoute} className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            AI route from Lot A
          </button>
        )}
        {loadingRoute && <span className="text-[10px] text-text-muted">Loading AI route...</span>}
      </div>
    </Card>
  );
}
