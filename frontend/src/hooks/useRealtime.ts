import { useEffect, useRef, useState, useCallback } from "react";

const WS_BASE = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000";

export interface RealtimeState {
  type: string;
  timestamp: string;
  tick: number;
  match_minute: number;
  match_status: string;
  crowd_density: { id: string; name: string; density: number; capacity: number }[];
  transit: { id: string; name: string; mode: string; status: string; delay_minutes: number; next_departure: string }[];
  wait_times: { id: string; name: string; type: string; zone: string; current_wait_min: number; status: string }[];
  analysis?: {
    recommendations: { id: string; title: string; description: string; priority: string }[];
    volunteer_tasks: { type: string; zone: string; description: string; priority: string }[];
  };
}

export function useRealtime() {
  const [state, setState] = useState<RealtimeState | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let closed = false;

    function connect() {
      if (closed) return;
      const ws = new WebSocket(`${WS_BASE}/ws/realtime`);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "state_update" || data.type === "state") {
            setState(data);
          }
        } catch { /* ignore */ }
      };

      ws.onclose = () => {
        setConnected(false);
        if (!closed) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => ws.close();
    }

    connect();
    return () => {
      closed = true;
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []);

  const send = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { state, connected, send };
}
