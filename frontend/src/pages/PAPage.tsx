import { useState } from "react";
import { Radio, Send, AlertTriangle, Info, AlertCircle, Volume2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { apiClient } from "@/services/apiClient";
import { Navbar } from "@/components/navigation/Navbar";
import type { PAAnnouncementResponse, PALogResponse } from "@/services/pa";

const ANNOUNCEMENT_TYPES = [
  { id: "gate_closed", label: "Gate Closed", icon: AlertTriangle, severity: "high" },
  { id: "evacuation", label: "Evacuation", icon: AlertCircle, severity: "critical" },
  { id: "delay", label: "Delay Notice", icon: Info, severity: "medium" },
  { id: "weather", label: "Weather Advisory", icon: AlertTriangle, severity: "medium" },
  { id: "medical", label: "Medical Alert", icon: AlertCircle, severity: "high" },
  { id: "lost_child", label: "Lost Child", icon: Info, severity: "medium" },
  { id: "general", label: "General Notice", icon: Info, severity: "low" },
];

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "es", label: "Spanish" },
  { id: "fr", label: "French" },
  { id: "de", label: "German" },
  { id: "ar", label: "Arabic" },
  { id: "zh", label: "Mandarin" },
];

const GATES = ["Gate A", "Gate B", "Gate C", "Gate D", "Gate E", "South Plaza", "Fan Zone"];

export function PAPage() {
  const [type, setType] = useState("gate_closed");
  const [severity, setSeverity] = useState("high");
  const [message, setMessage] = useState("");
  const [gate, setGate] = useState("Gate B");
  const [languages, setLanguages] = useState(["en", "es", "fr"]);
  const [broadcast, setBroadcast] = useState(false);
  const [result, setResult] = useState<PAAnnouncementResponse | null>(null);
  const [log, setLog] = useState<PALogResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [logLoading, setLogLoading] = useState(false);

  const toggleLang = (id: string) => {
    setLanguages((prev) => prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]);
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await apiClient<PAAnnouncementResponse>("/pa/announce", {
        method: "POST",
        body: JSON.stringify({ type, severity, message, gate, languages, broadcast }),
      });
      setResult(res);
      setMessage("");
    } catch {}
    setLoading(false);
  };

  const loadLog = async () => {
    setLogLoading(true);
    try {
      const res = await apiClient<PALogResponse>("/pa/log");
      setLog(res);
    } catch {}
    setLogLoading(false);
  };

  return (
    <div className="min-h-screen bg-pitch-night text-text-primary font-ui relative overflow-x-hidden">
      {/* Global Navbar */}
      <Navbar />

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-10" />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-rose-500/[0.03] blur-[80px]" />

      <div className="mx-auto max-w-5xl px-6 pt-24 pb-16 relative z-10">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between border-b border-white/[0.05] pb-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-fan bg-rose-500/10 text-rose-400">
                <Radio size={14} />
              </span>
              Emergency PA System
            </h1>
            <p className="text-body text-text-secondary mt-1">AI translation pipeline for instant multilingual broadcasts</p>
          </div>
          <Badge variant="warning" className="bg-amber-500/15 border-amber-500/30 text-amber-300">Command Center</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          {/* Left Compose Section */}
          <div className="space-y-4">
            <div className="glass-card p-5 rounded-fan border border-white/[0.08] shadow-data">
              <h3 className="mb-4 font-display text-body-lg font-semibold text-text-primary flex items-center gap-2">
                <Radio size={16} className="text-rose-500" />
                Compose Broadcast
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-data font-semibold text-text-muted uppercase tracking-wider">Announcement Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ANNOUNCEMENT_TYPES.map((t) => (
                      <button 
                        key={t.id} 
                        onClick={() => { setType(t.id); setSeverity(t.severity); }}
                        className={`flex items-center gap-2 rounded-data px-3 py-2 text-data-md font-semibold text-left transition-all ${
                          type === t.id 
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" 
                            : "bg-white/[0.03] text-text-secondary border border-transparent hover:bg-white/[0.05]"
                        }`}
                      >
                        <t.icon size={12} className="shrink-0" /> {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-data font-semibold text-text-muted uppercase tracking-wider">Target Gate</label>
                    <select 
                      value={gate} 
                      onChange={(e) => setGate(e.target.value)} 
                      className="w-full rounded-data border border-white/[0.08] bg-pitch-night/80 px-3 py-2 text-body text-text-primary outline-none focus:border-rose-500/50 transition-colors"
                    >
                      {GATES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-data font-semibold text-text-muted uppercase tracking-wider">Severity</label>
                    <div className="flex h-9 items-center px-3 rounded-data bg-white/[0.03] border border-white/[0.08] text-body capitalize font-semibold">
                      <span className={`h-2 w-2 rounded-full mr-2 ${
                        severity === "critical" ? "bg-rose-500 animate-ping" : severity === "high" ? "bg-orange-500" : "bg-blue-400"
                      }`} />
                      {severity}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-data font-semibold text-text-muted uppercase tracking-wider">Message Content</label>
                  <textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    rows={3} 
                    placeholder="Enter broadcast message details in English…"
                    className="w-full rounded-data border border-white/[0.08] bg-pitch-night/80 px-3 py-2.5 text-body text-text-primary outline-none focus:border-rose-500/50 resize-none transition-colors placeholder:text-text-muted" 
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-data font-semibold text-text-muted uppercase tracking-wider">Target Languages ({languages.length})</label>
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGES.map((l) => (
                      <button 
                        key={l.id} 
                        onClick={() => toggleLang(l.id)}
                        className={`rounded-pill px-3 py-1 text-data font-semibold border transition-all ${
                          languages.includes(l.id) 
                            ? "bg-pitch-green-500/10 text-pitch-green-400 border-pitch-green-500/30" 
                            : "bg-transparent text-text-muted border-white/[0.08] hover:bg-white/[0.03]"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-white/[0.05] pt-4">
                  <label className="flex items-center gap-2 text-data-md font-semibold text-text-secondary cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={broadcast} 
                      onChange={(e) => setBroadcast(e.target.checked)}
                      className="accent-rose-500 h-4 w-4 rounded border-white/[0.08] bg-pitch-night" 
                    />
                    Live Transmission Broadcast
                  </label>
                  <Badge variant={broadcast ? "error" : "default"} className={broadcast ? "bg-rose-500/10 text-rose-400 border border-rose-500/30" : ""}>
                    {broadcast ? "LIVE" : "Draft"}
                  </Badge>
                </div>

                <Button className="w-full shadow-[0_0_15px_rgba(244,63,94,0.2)]" variant={broadcast ? "destructive" : "primary"} onClick={handleSend} disabled={!message.trim() || loading}>
                  {loading ? <Spinner size="sm" /> : <Send size={14} />}
                  {broadcast ? "Trigger Live Broadcast" : "Generate Audio Translation"}
                </Button>
              </div>
            </div>

            {result && (
              <div className="glass-card p-5 rounded-fan border border-pitch-green-500/20 bg-pitch-green-500/[0.02] shadow-data">
                <h3 className="mb-3.5 font-display text-body-lg font-bold text-pitch-green-400 flex items-center gap-2">
                  <Volume2 size={16} /> Broadcast Generated Successfully
                </h3>
                <div className="space-y-3">
                  {Object.entries(result.announcement.translations).map(([lang, text]) => (
                    <div key={lang} className="rounded-data bg-white/[0.02] border border-white/[0.05] p-3">
                      <Badge className="mb-2 font-display uppercase font-semibold">{lang}</Badge>
                      <p className="text-body text-text-primary leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-data-md font-semibold text-text-secondary flex items-center gap-2 border-t border-white/[0.05] pt-3">
                  <span>Broadcast status:</span> 
                  <Badge variant={result.announcement.broadcast ? "error" : "default"}>{result.announcement.status}</Badge>
                </div>
              </div>
            )}
          </div>

          {/* Right Log Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
              <h3 className="font-display text-body-lg font-bold text-text-primary">Logs Feed</h3>
              <Button size="sm" variant="ghost" onClick={loadLog} disabled={logLoading}>
                {logLoading ? <Spinner size="sm" /> : <RefreshCw size={14} className={logLoading ? "animate-spin" : ""} />}
              </Button>
            </div>

            {log && log.announcements.length === 0 && (
              <div className="glass-card p-8 text-center rounded-fan border border-white/[0.08]">
                <Radio size={36} className="mx-auto mb-3 text-text-muted/30" />
                <p className="text-body text-text-muted">No historical broadcasts found</p>
              </div>
            )}

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {log && log.announcements.map((a) => (
                <div key={a.id} className="glass-card p-4 rounded-fan border border-white/[0.06] shadow-data space-y-3 hover:border-white/15 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={a.severity === "critical" ? "error" : a.severity === "high" ? "warning" : "default"}>
                        {a.type.replace("_", " ")}
                      </Badge>
                      <span className="text-data font-semibold text-text-secondary uppercase tracking-wider">{a.gate}</span>
                    </div>
                    <span className="text-data text-text-muted">{new Date(a.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-body text-text-primary leading-relaxed">{a.message}</p>
                  <div className="mt-2 flex items-center justify-between text-data text-text-muted border-t border-white/[0.03] pt-2">
                    <span>Langs: {a.languages.map((l) => l.toUpperCase()).join(", ")}</span>
                    {a.broadcast && <Badge variant="error" className="bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold px-2 py-0.5">BROADCASTED</Badge>}
                  </div>
                </div>
              ))}
            </div>

            {!log && (
              <div className="glass-card p-8 text-center rounded-fan border border-white/[0.08]">
                <Spinner size="lg" className="mx-auto mb-3 text-rose-400" />
                <p className="text-body text-text-muted">Refresh log feed using button above</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
