import { useState } from "react";
import { MapPin } from "lucide-react";
import { useRoute } from "@/hooks/useNavRoute";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

const ZONES = [
  { id: "gate-a", label: "Gate A", type: "gate" as const, x: 20, y: 10 },
  { id: "gate-b", label: "Gate B", type: "gate" as const, x: 40, y: 10 },
  { id: "gate-c", label: "Gate C", type: "gate" as const, x: 60, y: 10 },
  { id: "gate-d", label: "Gate D", type: "gate" as const, x: 80, y: 10 },
  { id: "gate-e", label: "Gate E", type: "gate" as const, x: 50, y: 90 },
  { id: "section-100", label: "100 Level", type: "section" as const, x: 30, y: 35 },
  { id: "section-200", label: "200 Club", type: "section" as const, x: 60, y: 35 },
  { id: "section-300", label: "300 Level", type: "section" as const, x: 45, y: 55 },
  { id: "first-aid", label: "First Aid", type: "amenity" as const, x: 25, y: 70 },
  { id: "info", label: "Info Desk", type: "amenity" as const, x: 70, y: 70 },
];

interface Props {
  onSelectZone?: (id: string) => void;
  selectedZone?: string | null;
  accessibleMode?: boolean;
}

export function VenueMap({ onSelectZone, selectedZone, accessibleMode }: Props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [searchFrom, setSearchFrom] = useState<string | null>(null);
  const [searchTo, setSearchTo] = useState<string | null>(null);
  const { data: route, isFetching } = useRoute(searchFrom, searchTo, accessibleMode);

  const handleRoute = () => {
    if (!from || !to) return;
    setSearchFrom(from);
    setSearchTo(to);
  };

  return (
    <Card variant="data" className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <MapPin size={16} className="text-floodlight-200" />
        <h3 className="font-display text-h3 font-semibold text-text-primary">Venue Map</h3>
        {accessibleMode && <Badge variant="success">Accessible routes</Badge>}
      </div>
      <svg viewBox="0 0 100 100" className="w-full rounded-data border border-border bg-pitch-night" style={{ maxHeight: 280 }}>
        <rect x="15" y="5" width="70" height="90" fill="none" stroke="currentColor" className="text-border" strokeWidth="0.5" rx="2" />
        <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" className="text-border" strokeWidth="0.3" />
        {ZONES.map((z) => (
          <g key={z.id} onClick={() => onSelectZone?.(z.id)} className="cursor-pointer">
            <circle
              cx={z.x} cy={z.y} r={z.id === selectedZone ? 4 : 3}
              fill={z.id === selectedZone ? "#fde047" : z.type === "gate" ? "#22c55e" : z.type === "section" ? "#f97316" : "#64748b"}
              className="transition-all hover:opacity-80"
            />
            <text x={z.x} y={z.y - 4} textAnchor="middle" fill="#94a3b8" fontSize="2.5" fontFamily="Inter, sans-serif">
              {z.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="venue-from" className="mb-0.5 block font-ui text-data text-text-muted">From</label>
          <select id="venue-from" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-data border border-border bg-pitch-night px-2 py-1 font-ui text-data text-text-primary outline-none focus:border-floodlight-200/50">
            <option value="">Select…</option>
            {ZONES.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="venue-to" className="mb-0.5 block font-ui text-data text-text-muted">To</label>
          <select id="venue-to" value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-data border border-border bg-pitch-night px-2 py-1 font-ui text-data text-text-primary outline-none focus:border-floodlight-200/50">
            <option value="">Select…</option>
            {ZONES.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
          </select>
        </div>
      </div>
      <Button size="sm" className="mt-2 w-full" onClick={handleRoute} disabled={!from || !to || isFetching}>
        {isFetching ? <Spinner size="sm" /> : null}
        Find Route
      </Button>
      {route && (
        <div className="mt-2 rounded-data bg-pitch-raised p-2">
          <p className="font-ui text-data text-text-secondary">
            Route: {ZONES.find((z) => z.id === searchFrom)?.label} → {ZONES.find((z) => z.id === searchTo)?.label}
            <span className="text-text-muted"> ({route.total_distance_m}m, {route.accessible ? "accessible" : "standard"})</span>
          </p>
          <ol className="mt-1 list-inside list-decimal font-ui text-data text-text-muted">
            {route.steps.map((s, i) => (
              <li key={i}>{s.instruction} ({s.distance_m}m)</li>
            ))}
          </ol>
        </div>
      )}
      {searchFrom && !isFetching && !route && (
        <div className="mt-2 rounded-data bg-pitch-raised p-2 text-center font-ui text-data text-text-muted">
          No route found
        </div>
      )}
    </Card>
  );
}
