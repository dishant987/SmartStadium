import { Play, Square, RotateCcw, Flame, Ban } from "lucide-react";

interface Props {
  running: boolean;
  mode: "fire" | "obstacle" | null;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onSetMode: (m: "fire" | "obstacle" | null) => void;
}

export function ControlPanel({ running, mode, onStart, onStop, onReset, onSetMode }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {!running ? (
          <button onClick={onStart} className="flex flex-1 items-center justify-center gap-2 rounded-fan bg-pitch-green-500 px-3 py-2 text-body font-medium text-white transition-colors hover:bg-pitch-green-600">
            <Play size={14} /> Start
          </button>
        ) : (
          <button onClick={onStop} className="flex flex-1 items-center justify-center gap-2 rounded-fan bg-alert-red px-3 py-2 text-body font-medium text-white transition-colors hover:bg-red-600">
            <Square size={14} /> Stop
          </button>
        )}
        <button onClick={onReset} className="flex items-center justify-center gap-2 rounded-fan border border-border bg-pitch-surface px-3 py-2 text-body text-text-secondary transition-colors hover:bg-pitch-raised hover:text-text-primary">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="text-data text-text-muted uppercase tracking-wider">Inject hazard</div>
      <div className="flex gap-2">
        <button
          onClick={() => onSetMode(mode === "fire" ? null : "fire")}
          aria-pressed={mode === "fire"}
          className={`flex flex-1 items-center justify-center gap-2 rounded-fan border px-3 py-2 text-body font-medium transition-colors ${
            mode === "fire"
              ? "border-alert-red bg-alert-red/20 text-alert-red"
              : "border-border bg-pitch-surface text-text-secondary hover:bg-pitch-raised"
          }`}
        >
          <Flame size={14} /> Fire
        </button>
        <button
          onClick={() => onSetMode(mode === "obstacle" ? null : "obstacle")}
          aria-pressed={mode === "obstacle"}
          className={`flex flex-1 items-center justify-center gap-2 rounded-fan border px-3 py-2 text-body font-medium transition-colors ${
            mode === "obstacle"
              ? "border-alert-orange bg-alert-orange/20 text-alert-orange"
              : "border-border bg-pitch-surface text-text-secondary hover:bg-pitch-raised"
          }`}
        >
          <Ban size={14} /> Barrier
        </button>
      </div>
    </div>
  );
}
