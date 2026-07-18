import { Accessibility, Eye, Type } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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
  return (
    <Card variant="data" className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Accessibility size={16} className="text-floodlight-200" />
        <h3 className="font-display text-h3 font-semibold text-text-primary">Accessibility</h3>
      </div>
      <div className="mb-3 flex gap-2">
        <Button size="sm" variant={accessibleMode ? "primary" : "secondary"} onClick={onToggle}>
          <Accessibility size={14} /> Routes
        </Button>
        <Button size="sm" variant={largeText ? "primary" : "secondary"} onClick={onToggleText}>
          <Type size={14} /> Text
        </Button>
      </div>
      <p className="mb-2 font-ui text-data text-text-muted">Accessible amenities at MetLife Stadium:</p>
      <div className="space-y-1.5">
        {AMENITIES.map((a) => (
          <div key={a.label} className="flex items-center justify-between rounded-data bg-pitch-raised px-2.5 py-1.5">
            <span className={`font-ui ${largeText ? "text-body" : "text-data"} text-text-primary`}>{a.label}</span>
            <Badge>{a.location}</Badge>
          </div>
        ))}
      </div>
      <p className="mt-2 font-ui text-data text-text-muted">{largeText ? "Simplified language mode active" : "Ask the Fan Companion for custom directions"}</p>
    </Card>
  );
}
