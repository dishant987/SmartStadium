import { useState, useEffect, useRef, useCallback } from "react";
import { SimulationCanvas } from "@/components/evacuation/SimulationCanvas";
import { ControlPanel } from "@/components/evacuation/ControlPanel";
import { EnvironmentPanel } from "@/components/evacuation/EnvironmentPanel";
import { MetricsPanel } from "@/components/evacuation/MetricsPanel";
import { ResponderLog } from "@/components/evacuation/ResponderLog";
import { Navbar } from "@/components/navigation/Navbar";

interface State {
  width: number;
  height: number;
  agents: { x: number; y: number; evacuated: boolean }[];
  fires: [number, number][];
  obstacles: [number, number][];
  responders: { id: number; sector: number[] }[];
  tick: number;
  agent_count: number;
  total_agents: number;
  evacuated: number;
  running: boolean;
  complete?: boolean;
  message?: string;
  decisions: { responder_id: number; action: string; reasoning: string; target: number[]; tick: number }[];
}

export function EvacuationPage() {
  const [simState, setSimState] = useState<State | null>(null);
  const [mode, setMode] = useState<"fire" | "obstacle" | null>(null);
  const [allDecisions, setAllDecisions] = useState<State["decisions"]>([]);
  const [connected, setConnected] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<string>("tactical");
  const [lightingMode, setLightingMode] = useState<"matchday" | "night" | "emergency">("night");
  const [weather, setWeather] = useState<"clear" | "rain">("clear");
  const [heatmapEnabled, setHeatmapEnabled] = useState<boolean>(true);
  const wsRef = useRef<WebSocket | null>(null);

  // Automatically switch light mode to emergency when running
  useEffect(() => {
    if (simState?.running && !simState?.complete) {
      setLightingMode("emergency");
    } else if (simState?.complete) {
      setLightingMode("night");
    }
  }, [simState?.running, simState?.complete]);

  useEffect(() => {
    const defaultWs = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//localhost:8000`;
    const wsBase = import.meta.env.VITE_WS_BASE_URL || defaultWs;
    const ws = new WebSocket(`${wsBase}/ws/evacuation`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "state") {
          setSimState(data);
          if (data.decisions?.length) {
            setAllDecisions((prev) => [...prev, ...data.decisions].slice(-50));
          }
        }
      } catch {
        // ponytail: silent catch on WS message parse
      }
    };

    return () => { ws.close(); };
  }, []);

  const send = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (!mode) return;
    send(mode === "fire" ? { type: "inject_fire", row, col } : { type: "inject_obstacle", row, col });
  }, [mode, send]);

  return (
    <div className="flex h-screen flex-col bg-pitch-night text-text-primary font-ui relative overflow-hidden">
      {/* Global Navbar */}
      <Navbar />

      {/* Main Workspace shifted down under Navbar */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex flex-1 flex-col p-6 overflow-y-auto">
          {/* Subheader */}
          <div className="flex items-center justify-between mb-5 border-b border-white/[0.05] pb-3.5 shrink-0">
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                Crowd Evacuation Simulator
              </h2>
              <p className="text-data text-text-muted">Dynamic hazard injection & Gemini responder rerouting</p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white/[0.02] border border-white/[0.05] px-3.5 py-1 text-data font-medium">
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-pitch-green-500 animate-pulse" : "bg-rose-500"}`} />
              <span className="text-text-secondary">{connected ? "Engine Streaming" : "Disconnected"}</span>
            </div>
          </div>

          <div className="flex-1 min-h-[350px] relative rounded-fan border border-white/[0.06] bg-pitch-surface/20 p-2 overflow-hidden shadow-data">
            <SimulationCanvas
              state={simState}
              mode={mode}
              onCellClick={handleCellClick}
              cameraPreset={cameraPreset}
              lightingMode={lightingMode}
              weather={weather}
              heatmapEnabled={heatmapEnabled}
            />
          </div>

          {simState?.complete && (
            <div className="mt-3.5 rounded-fan border border-pitch-green-500/20 bg-pitch-green-500/5 px-4 py-3 text-center text-body-lg font-medium text-pitch-green-400">
              {simState.message || "Evacuation complete!"}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-80 shrink-0 border-l border-white/[0.08] bg-pitch-surface/10 p-5 space-y-6 overflow-y-auto relative z-10">
          <ControlPanel
            running={simState?.running ?? false}
            mode={mode}
            onStart={() => send({ type: "start" })}
            onStop={() => send({ type: "stop" })}
            onReset={() => { setAllDecisions([]); send({ type: "reset" }); }}
            onSetMode={setMode}
          />

          <EnvironmentPanel
            cameraPreset={cameraPreset}
            setCameraPreset={setCameraPreset}
            lightingMode={lightingMode}
            setLightingMode={setLightingMode}
            weather={weather}
            setWeather={setWeather}
            heatmapEnabled={heatmapEnabled}
            setHeatmapEnabled={setHeatmapEnabled}
          />

          <MetricsPanel
            tick={simState?.tick ?? 0}
            agentCount={simState?.agent_count ?? 0}
            totalAgents={simState?.total_agents ?? 300}
            evacuated={simState?.evacuated ?? 0}
            fires={simState?.fires?.length ?? 0}
            running={simState?.running ?? false}
            complete={simState?.complete ?? false}
          />

          <ResponderLog decisions={allDecisions} />
        </aside>
      </div>
    </div>
  );
}
