import { Shield, Flame, Users, Clock, AlertTriangle } from "lucide-react";

interface Props {
  tick: number;
  agentCount: number;
  totalAgents: number;
  evacuated: number;
  fires: number;
  running: boolean;
  complete: boolean;
}

export function MetricsPanel({ tick, agentCount, totalAgents, evacuated, fires, running, complete }: Props) {
  const elapsed = (tick * 0.05).toFixed(1);
  const pct = totalAgents > 0 ? ((evacuated / totalAgents) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Metric icon={<Users size={14} />} label="Remaining" value={String(agentCount)} color="text-blue-400" />
        <Metric icon={<Shield size={14} />} label="Evacuated" value={`${evacuated} (${pct}%)`} color="text-pitch-green-400" />
        <Metric icon={<Clock size={14} />} label="Time" value={`${elapsed}s`} color="text-text-primary" />
        <Metric icon={<Flame size={14} />} label="Fires" value={String(fires)} color={fires > 0 ? "text-alert-red" : "text-text-muted"} />
      </div>

      {/* progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-pitch-raised">
        <div
          className="h-full rounded-full bg-pitch-green-500 transition-all duration-100"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center gap-2 text-data">
        <span className={`h-2 w-2 rounded-full ${running ? "bg-pitch-green-500 animate-pulse" : complete ? "bg-floodlight-200" : "bg-text-muted"}`} />
        <span className="text-text-muted">
          {complete ? "Evacuation complete" : running ? "Simulating..." : "Paused"}
        </span>
      </div>

      {fires > 5 && (
        <div className="flex items-center gap-2 rounded-data bg-alert-red/10 px-2 py-1 text-data text-alert-red">
          <AlertTriangle size={12} /> Critical: multiple fires active
        </div>
      )}
    </div>
  );
}

function Metric({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-data bg-pitch-raised px-2.5 py-2">
      <div className="flex items-center gap-1.5 text-data text-text-muted">
        {icon} {label}
      </div>
      <div className={`mt-0.5 text-body-lg font-semibold ${color}`}>{value}</div>
    </div>
  );
}
