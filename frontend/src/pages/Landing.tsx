import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { useState, useCallback, memo, lazy, Suspense } from "react";

const CrowdDensityWidget = lazy(() => import("@/components/dashboard/CrowdDensityWidget").then(m => ({ default: m.CrowdDensityWidget })));
const IncidentFeed = lazy(() => import("@/components/dashboard/IncidentFeed").then(m => ({ default: m.IncidentFeed })));
const DecisionSupportPanel = lazy(() => import("@/components/dashboard/DecisionSupportPanel").then(m => ({ default: m.DecisionSupportPanel })));
const VenueMap = lazy(() => import("@/components/navigation/VenueMap").then(m => ({ default: m.VenueMap })));
const TransitWidget = lazy(() => import("@/components/transport/TransitWidget").then(m => ({ default: m.TransitWidget })));
const AccessibilityPanel = lazy(() => import("@/components/accessibility/AccessibilityPanel").then(m => ({ default: m.AccessibilityPanel })));
const SustainabilityWidget = lazy(() => import("@/components/sustainability/SustainabilityWidget").then(m => ({ default: m.SustainabilityWidget })));
const WaitTimeWidget = lazy(() => import("@/components/waittimes/WaitTimeWidget").then(m => ({ default: m.WaitTimeWidget })));
const InteractiveFootball = lazy(() => import("@/components/interactive/InteractiveFootball").then(m => ({ default: m.InteractiveFootball })));
import {
  Clock,
  Volume2,
  BarChart3,
  Users,
  ArrowRight,
  Navigation,
  Activity
} from "lucide-react";

const STATS = [
  { value: "82,500", label: "Monitored Seats", icon: <Users size={18} className="text-pitch-green-400" /> },
  { value: "< 30s", label: "Gemini Sync Speed", icon: <Clock size={18} className="text-emerald-400" /> },
  { value: "6 Languages", label: "PA Translation", icon: <Volume2 size={18} className="text-blue-400" /> },
];

const FEATURE_LINKS = [
  {
    title: "Smart Wayfinding",
    desc: "Step-by-step navigation avoiding escalators or stairs for custom accessibility routing.",
    borderClass: "hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]",
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/5",
    icon: <Navigation size={20} />,
    link: "/wayfinding"
  },
  {
    title: "Concessions Monitor",
    desc: "AI concessions wait times calculated based on live stand volumes and heatmaps.",
    borderClass: "hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]",
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/5",
    icon: <Clock size={20} />,
    link: "/chat"
  },
  {
    title: "Emergency PA",
    desc: "Emergency broadcast module translating messages instantly into 6 world languages.",
    borderClass: "hover:border-rose-500/30 hover:shadow-[0_0_30px_rgba(244,63,94,0.08)]",
    iconColor: "text-rose-400",
    bgColor: "bg-rose-500/5",
    icon: <Volume2 size={20} />,
    link: "/pa"
  },
  {
    title: "Match Analytics",
    desc: "Post-match crowd speed diagnostics, gate throughput stats, and transit reviews.",
    borderClass: "hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.08)]",
    iconColor: "text-purple-400",
    bgColor: "bg-purple-500/5",
    icon: <BarChart3 size={20} />,
    link: "/analytics"
  },
];

const HOW_STEPS = [
  { num: "01", title: "Arrive Smart", desc: "Check Meadowlands rail status, parking lot capacity, and gate lines before leaving.", icon: <Navigation size={18} className="text-blue-400" /> },
  { num: "02", title: "Navigate Accessible", desc: "Get steps avoiding stairs, escalator status, and lift coordinates in real time.", icon: <Activity size={18} className="text-pitch-green-400" /> },
  { num: "03", title: "Ask Anything", desc: "Where is the nearest water refiller? What time is the next train? The assistant responds instantly.", icon: <Users size={18} className="text-floodlight-200" /> },
];

export const Landing = memo(function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [accessibleMode, setAccessibleMode] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [activeTab, setActiveTab] = useState<"venue" | "crowd" | "incident" | "transit">("venue");
  const toggleAccessible = useCallback(() => setAccessibleMode((p) => !p), []);
  const toggleLargeText = useCallback(() => setLargeText((p) => !p), []);

  return (
    <div className={`min-h-screen bg-pitch-night text-text-primary font-ui relative overflow-x-hidden ${largeText ? "accessibility-large-text" : ""}`}>
      {/* ─── GLOBAL NAVBAR ─── */}
      <Navbar />

      {/* ─── HERO SECTION ─── */}
      <header className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-12">
        {/* Modern Dot Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
        
        {/* Soft Ambient Mesh Orbs */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-pitch-green-500/[0.04] blur-[180px] animate-pulse-glow" />
          <div className="absolute right-[-10%] bottom-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/[0.03] blur-[180px] animate-pulse-glow" style={{ animationDelay: "3s" }} />
        </div>

        {/* Floating Grab & Throw 3D Football (Interactive Physics-based) */}
        <Suspense fallback={null}>
          <InteractiveFootball />
        </Suspense>

        {/* Hero Content */}
        <div className="relative mx-auto max-w-3xl text-center z-10 px-4">
          <div className="inline-flex items-center gap-2 mb-6 bg-white/[0.03] border border-white/[0.08] px-4 py-1.5 rounded-full text-data font-semibold text-text-primary tracking-wide backdrop-blur-md shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pitch-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-pitch-green-500" />
            </span>
            <span>FIFA WORLD CUP 2026</span>
            <span className="h-3 w-px bg-white/20" />
            <span className="text-pitch-green-400 uppercase font-mono text-[10px]">Telemetry</span>
          </div>

          <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
            The next generation of
            <br />
            <span className="text-pitch-green-400 font-extrabold block mt-3">
              Stadium Intelligence
            </span>
          </h1>

          <p className="mx-auto mt-6 text-sm md:text-base leading-relaxed text-text-secondary max-w-xl">
            Real-time crowd tracking, predictive transit feeds, emergency PA translation, and an AI companion for fans. Experience matchdays driven by data.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate(user ? "/chat" : "/login")} className="w-full sm:w-auto bg-pitch-green-500 hover:bg-pitch-green-600 text-pitch-night font-semibold px-8 py-3.5 rounded-xl shadow-[0_4px_20px_rgba(74,222,128,0.2)] hover:scale-102 transition-all">
              {user ? "Open AI Companion" : "Launch Console"} <ArrowRight className="ml-2 inline-block" size={16} />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => document.getElementById("dashboard-preview")?.scrollIntoView({ behavior: "smooth" })} className="w-full sm:w-auto bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl backdrop-blur-md transition-all">
              Explore Live Telemetry
            </Button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="relative mt-12 grid w-full max-w-4xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md shadow-2xl z-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-pitch-surface/20 px-6 py-6 text-center transition-all hover:bg-white/[0.03] flex flex-col items-center justify-center">
              <div className="mb-2 flex items-center justify-center p-2 rounded-full bg-white/[0.02] border border-white/[0.06]">
                {stat.icon}
              </div>
              <div className="font-display text-2xl font-bold text-white md:text-3xl tracking-tight">{stat.value}</div>
              <div className="mt-1 text-[10px] font-mono text-text-muted uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scrolling Telemetry Marquee Log Ticker */}
        <div className="w-full max-w-4xl mt-4 border border-white/[0.06] bg-slate-950/45 rounded-xl px-4 py-2.5 flex items-center overflow-hidden z-10 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-r border-white/10 pr-4 mr-4 text-[10px] font-mono text-[#00FF87] shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>SYSTEM MONITOR:</span>
          </div>
          <div className="relative flex-1 overflow-hidden h-4">
            <div className="absolute flex gap-12 text-[10px] font-mono text-text-secondary/75 whitespace-nowrap animate-marquee">
              <span>[18:22:49] CONCOURSE_WEST: FLOW RATE OPTIMAL</span>
              <span>[18:22:52] PA_BROADCAST: TRANSLATION SERVERS OPERATIONAL</span>
              <span>[18:22:55] RADAR_DENSITY: SECTIONS 100-104 STABLE</span>
              <span>[18:22:58] WAYFINDING_ACC: ALL LIFTS ACTIVE</span>
              <span>[18:23:02] MEADOWLANDS_RAIL: ON-TIME DISPATCH SCHEDULED</span>
              <span>[18:22:49] CONCOURSE_WEST: FLOW RATE OPTIMAL</span>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            animation: marquee 25s linear infinite;
          }
        `}} />
      </header>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="relative mx-auto max-w-7xl px-6 py-20 z-10">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <Badge variant="default" className="mb-4 bg-white/5 border border-white/10 px-3 py-1 text-xs">Features Overview</Badge>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Dual-threat intelligence suite.
          </h2>
          <p className="mt-4 text-lg text-text-secondary leading-relaxed">
            One unified core delivering operational mastery for coordinators and instant assistant utilities for fans in the stadium seats.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Dashboard Preview Card - spans 2 columns */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-pitch-surface/10 p-8 md:col-span-2 md:row-span-2 shadow-2xl hover:border-pitch-green-500/20 transition-all duration-300 backdrop-blur-md">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-pitch-green-500/[0.02] blur-[80px] group-hover:scale-125 transition-all duration-500" />
            <div className="relative">
              <Badge variant="success" className="mb-4 bg-pitch-green-500/10 border border-pitch-green-500/30 px-2.5 py-1 text-xs text-pitch-green-400">COMMAND PORTAL</Badge>
              <h3 className="font-display text-2xl font-bold text-white tracking-tight">Real-time Command Hub</h3>
              <p className="mt-2 text-text-secondary leading-relaxed max-w-xl">
                Observe live crowd densities across gates, corridors, and stands. Handle active incident dispatching, dynamic pathway suggestions, and automated broadcasts.
              </p>
            </div>
            <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-pitch-night/60 p-4 shadow-inner">
              <CrowdDensityWidget />
            </div>
          </div>

          {/* Fan Companion Card - tall column */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-pitch-surface/10 p-8 shadow-2xl hover:border-blue-500/20 transition-all duration-300 flex flex-col justify-between backdrop-blur-md">
            <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-blue-500/[0.02] blur-[80px]" />
            <div className="relative">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                <Users size={24} />
              </div>
              <h3 className="font-display text-xl font-bold text-white tracking-tight">AI Fan Companion</h3>
              <p className="mt-3 text-text-secondary leading-relaxed">
                A multilingual assistant answering stadium FAQs, transit schedules, concession queues, and gate coordinates. Supporting English, Spanish, French, German, Arabic, and Mandarin.
              </p>
            </div>
            <div className="relative mt-8 pt-4 border-t border-white/[0.06]">
              <Link to="/chat" className="text-sm font-semibold text-blue-400 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                Open AI Companion <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Transit Live Feed Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-pitch-surface/10 p-8 shadow-2xl hover:border-emerald-500/20 transition-all duration-300 backdrop-blur-md">
            <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/[0.02] blur-[80px]" />
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <Clock size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-white tracking-tight">Transit Dispatch</h3>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Meadowlands Rail timetables, shuttle status, active parking occupancy rates, and real-time rideshare congestion data updated dynamically.
            </p>
          </div>
        </div>

        {/* Modular Grid Link Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {FEATURE_LINKS.map((f) => (
            <Link
              key={f.title}
              to={user ? f.link : "/login"}
              className={`group rounded-2xl border border-white/[0.06] bg-pitch-surface/10 p-6 shadow-xl transition-all hover:translate-y-[-4px] hover:bg-pitch-surface/20 ${f.borderClass}`}
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${f.bgColor} ${f.iconColor} transition-transform group-hover:scale-105`}>
                {f.icon}
              </div>
              <h4 className="font-display text-base font-bold text-white transition-colors">
                {f.title}
              </h4>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative border-y border-white/[0.06] bg-white/[0.01] px-6 py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <Badge variant="default" className="mb-4 bg-white/5 border border-white/10 px-3 py-1 text-xs">Stadium Experience</Badge>
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-white">
              From arrival to seat to final whistle
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {HOW_STEPS.map((step) => (
              <div key={step.num} className="group relative p-8 rounded-3xl border border-white/[0.04] bg-pitch-surface/10 hover:border-pitch-green-500/20 hover:bg-pitch-surface/15 transition-all duration-300">
                <div className="absolute top-8 right-8 flex items-center justify-center h-10 w-10 rounded-xl bg-white/[0.02] border border-white/[0.05] group-hover:scale-105 transition-transform duration-300">
                  {step.icon}
                </div>
                <div className="font-display text-5xl font-extrabold text-pitch-green-500/10 mb-4 transition-colors group-hover:text-pitch-green-500/20">{step.num}</div>
                <h3 className="font-display text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FULL DASHBOARD PREVIEW ─── */}
      <section id="dashboard-preview" className="relative mx-auto max-w-7xl px-6 py-28 z-10">
        <div className="mb-14 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge variant="success" className="mb-4 bg-pitch-green-500/10 border border-pitch-green-500/30 px-2.5 py-1 text-xs text-pitch-green-400">Live Preview Console</Badge>
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Telemetry Command Center
            </h2>
            <p className="mt-3 max-w-xl text-text-secondary leading-relaxed">
              Explore the functional modules of the operational dashboard. Click the tabs below to switch between live active control segments.
            </p>
          </div>
          
          {/* Tab buttons - styled like a segmented controller */}
          <div role="tablist" className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md self-center md:self-end">
            {[
              { id: "venue", label: "Venue Telemetry" },
              { id: "crowd", label: "Crowd Flows" },
              { id: "incident", label: "Incident Center" },
              { id: "transit", label: "Transit Hub" },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id as "venue" | "crowd" | "incident" | "transit")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-pitch-green-500 text-white shadow-lg shadow-pitch-green-500/20"
                    : "text-text-secondary hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Mockup Browser Frame */}
        <div className="relative rounded-3xl border border-white/[0.08] bg-pitch-surface/5 backdrop-blur-md overflow-hidden shadow-2xl">
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.01]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.02] border border-white/[0.05] font-mono text-[10px] text-text-muted">
              <span>https://console.spectrastadium.com/metlife-dashboard</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-pitch-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-pitch-green-500 animate-ping" />
              <span>LIVE_STREAM_ON</span>
            </div>
          </div>

          {/* Mock Console Content */}
          <div className="p-6 md:p-8">
            <Suspense fallback={<div className="h-64 animate-pulse rounded-fan bg-white/[0.03]" />}>
            {activeTab === "venue" && (
              <div role="tabpanel" id="tabpanel-venue" className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 glass-card rounded-2xl p-4 shadow-modal border border-white/[0.06] bg-pitch-surface/10">
                  <VenueMap selectedZone={selectedZone} onSelectZone={setSelectedZone} accessibleMode={accessibleMode} />
                </div>
                <div className="glass-card rounded-2xl p-6 shadow-modal border border-white/[0.06] bg-pitch-surface/10 flex flex-col justify-between">
                  <AccessibilityPanel accessibleMode={accessibleMode} onToggle={toggleAccessible} largeText={largeText} onToggleText={toggleLargeText} />
                </div>
              </div>
            )}

            {activeTab === "crowd" && (
              <div role="tabpanel" id="tabpanel-crowd" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="glass-card rounded-2xl p-4 shadow-modal border border-white/[0.06] bg-pitch-surface/10 lg:col-span-2">
                  <CrowdDensityWidget />
                </div>
                <div className="glass-card rounded-2xl p-4 shadow-modal border border-white/[0.06] bg-pitch-surface/10">
                  <WaitTimeWidget />
                </div>
              </div>
            )}

            {activeTab === "incident" && (
              <div role="tabpanel" id="tabpanel-incident" className="grid gap-6 md:grid-cols-2">
                <div className="glass-card rounded-2xl p-4 shadow-modal border border-white/[0.06] bg-pitch-surface/10">
                  <IncidentFeed />
                </div>
                <div className="glass-card rounded-2xl p-4 shadow-modal border border-white/[0.06] bg-pitch-surface/10">
                  <DecisionSupportPanel />
                </div>
              </div>
            )}

            {activeTab === "transit" && (
              <div role="tabpanel" id="tabpanel-transit" className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 glass-card rounded-2xl p-4 shadow-modal border border-white/[0.06] bg-pitch-surface/10">
                  <TransitWidget />
                </div>
                <div className="glass-card rounded-2xl p-4 shadow-modal border border-white/[0.06] bg-pitch-surface/10">
                  <SustainabilityWidget />
                </div>
              </div>
            )}
            </Suspense>
          </div>
        </div>
      </section>

      {/* ─── FOOTER CTA ─── */}
      <section className="relative px-6 py-32 overflow-hidden border-t border-white/[0.06] bg-white/[0.01]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-[400px] w-[400px] rounded-full bg-pitch-green-500/[0.04] blur-[120px]" />
          <div className="h-[400px] w-[400px] rounded-full bg-blue-500/[0.03] blur-[120px] translate-x-32" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center z-10 bg-pitch-surface/5 border border-white/[0.06] rounded-3xl p-12 md:p-16 backdrop-blur-md">
          <Badge variant="default" className="mb-4 bg-white/5 border border-white/10 px-3 py-1 text-xs">Access Portal</Badge>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-white md:text-6xl">
            Ready for kickoff?
          </h2>
          <p className="mt-6 text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Experience MetLife Stadium matchday telemetry powered by Gemini. Open the assistant companion or sign in to start mapping your path.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => navigate(user ? "/chat" : "/login")} className="bg-pitch-green-500 hover:bg-pitch-green-600 text-white font-semibold px-8 py-6 rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:scale-102 transition-all">
              {user ? "Open Assistant Companion" : "Create Free Account"}
            </Button>
          </div>
        </div>
      </section>

      {/* ─── GLOBAL FOOTER ─── */}
      <Footer />
    </div>
  );
});
