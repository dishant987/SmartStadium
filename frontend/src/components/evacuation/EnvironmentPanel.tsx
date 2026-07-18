import { Camera, Sun, Moon, AlertTriangle, Cloud, CloudRain, Map } from "lucide-react";

interface Props {
  cameraPreset: string;
  setCameraPreset: (preset: string) => void;
  lightingMode: "matchday" | "night" | "emergency";
  setLightingMode: (mode: "matchday" | "night" | "emergency") => void;
  weather: "clear" | "rain";
  setWeather: (w: "clear" | "rain") => void;
  heatmapEnabled: boolean;
  setHeatmapEnabled: (enabled: boolean) => void;
}

export function EnvironmentPanel({
  cameraPreset,
  setCameraPreset,
  lightingMode,
  setLightingMode,
  weather,
  setWeather,
  heatmapEnabled,
  setHeatmapEnabled
}: Props) {
  // Toggle weather when clicking again
  const toggleWeather = (target: "clear" | "rain") => {
    if (target === "rain") {
      setWeather(weather === "rain" ? "clear" : "rain");
    } else {
      setWeather("clear");
    }
  };

  // Toggle lighting when clicking again
  const toggleLighting = (target: "matchday" | "night" | "emergency") => {
    setLightingMode(lightingMode === target ? "night" : target);
  };

  return (
    <div className="space-y-4 rounded-fan border border-white/[0.06] bg-pitch-surface/30 p-4 backdrop-blur-md">
      <div className="text-data text-text-muted uppercase tracking-wider font-semibold">Environment & Views</div>

      {/* Camera Section */}
      <div className="space-y-2">
        <div className="text-data-sm text-text-secondary flex items-center gap-1.5">
          <Camera size={14} className="text-text-muted" /> Camera Preset
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: "tactical", label: "Tactical" },
            { id: "topdown", label: "Top Down" },
            { id: "mainstand", label: "Side View" },
            { id: "northgate", label: "End Zone" },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCameraPreset(c.id)}
              className={`rounded-data py-1.5 text-data-sm font-medium transition-all border ${cameraPreset === c.id
                  ? "border-pitch-green-500 bg-pitch-green-500/20 text-white shadow-sm font-semibold"
                  : "border-white/[0.04] bg-white/[0.02] text-text-secondary hover:text-text-primary hover:bg-white/[0.05]"
                }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lighting Section */}
      <div className="space-y-2">
        <div className="text-data-sm text-text-secondary flex items-center gap-1.5">
          <Sun size={14} className="text-text-muted" /> Lighting Mode
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: "matchday", label: "Day", icon: Sun, activeClass: "border-amber-500/50 bg-amber-500/10 text-amber-400" },
            { id: "night", label: "Night", icon: Moon, activeClass: "border-blue-500/50 bg-blue-500/10 text-blue-400" },
            { id: "emergency", label: "Alert", icon: AlertTriangle, activeClass: "border-red-500/50 bg-red-500/10 text-red-400 animate-pulse font-semibold" },
          ].map((item) => {
            const Icon = item.icon;
            const active = lightingMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => toggleLighting(item.id as any)}
                className={`flex flex-col items-center gap-1 rounded-data py-2 text-data-xs font-medium transition-all border ${active
                    ? item.activeClass
                    : "border-white/[0.04] bg-white/[0.02] text-text-secondary hover:text-text-primary hover:bg-white/[0.05]"
                  }`}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Weather & Heatmap Section in Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/[0.05]">
        {/* Weather Toggle */}
        <div className="space-y-1.5">
          <div className="text-data-sm text-text-secondary flex items-center gap-1.5">
            <Cloud size={14} className="text-text-muted" /> Rain FX
          </div>
          <button
            onClick={() => toggleWeather("rain")}
            className={`flex w-full items-center justify-center gap-2 rounded-data py-2 text-data-sm font-medium transition-all border ${weather === "rain"
                ? "border-blue-500/50 bg-blue-500/20 text-blue-400 font-semibold"
                : "border-white/[0.04] bg-white/[0.02] text-text-secondary hover:text-text-primary hover:bg-white/[0.05]"
              }`}
          >
            <CloudRain size={14} />
            {weather === "rain" ? "ON" : "OFF"}
          </button>
        </div>

        {/* Heatmap Toggle */}
        <div className="space-y-1.5">
          <div className="text-data-sm text-text-secondary flex items-center gap-1.5">
            <Map size={14} className="text-text-muted" /> Heatmap
          </div>
          <button
            onClick={() => setHeatmapEnabled(!heatmapEnabled)}
            className={`flex w-full items-center justify-center gap-2 rounded-data py-2 text-data-sm font-medium transition-all border ${heatmapEnabled
                ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400 font-semibold"
                : "border-white/[0.04] bg-white/[0.02] text-text-secondary hover:text-text-primary hover:bg-white/[0.05]"
              }`}
          >
            <Map size={14} />
            {heatmapEnabled ? "ON" : "OFF"}
          </button>
        </div>
      </div>
    </div>
  );
}
