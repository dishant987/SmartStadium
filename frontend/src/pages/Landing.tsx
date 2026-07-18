import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CrowdDensityWidget } from "@/components/dashboard/CrowdDensityWidget";
import { IncidentFeed } from "@/components/dashboard/IncidentFeed";
import { DecisionSupportPanel } from "@/components/dashboard/DecisionSupportPanel";
import { VenueMap } from "@/components/navigation/VenueMap";
import { TransitWidget } from "@/components/transport/TransitWidget";
import { AccessibilityPanel } from "@/components/accessibility/AccessibilityPanel";
import { SustainabilityWidget } from "@/components/sustainability/SustainabilityWidget";
import { WaitTimeWidget } from "@/components/waittimes/WaitTimeWidget";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { InteractiveFootball } from "@/components/interactive/InteractiveFootball";
import { useState, useCallback } from "react";
import {
  Clock,
  Volume2,
  BarChart3,
  Users,
  ArrowRight,
  Navigation
} from "lucide-react";

export function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [accessibleMode, setAccessibleMode] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const toggleAccessible = useCallback(() => setAccessibleMode((p) => !p), []);
  const toggleLargeText = useCallback(() => setLargeText((p) => !p), []);

  return (
    <div className={`min-h-screen bg-pitch-night text-text-primary font-ui relative ${largeText ? "accessibility-large-text" : ""}`}>
      {/* ─── GLOBAL NAVBAR ─── */}
      <Navbar />

      {/* ─── HERO SECTION ─── */}
      <header className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20">
        {/* Moving Grid lines */}
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />

        {/* Glowing Blobs */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-pitch-green-500/[0.05] blur-[120px] animate-pulse-glow" />
          <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-floodlight-200/[0.04] blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>

        {/* Floating Grab & Throw 3D Football (Interactive Physics-based) */}
        <InteractiveFootball />


        <div className="relative mx-auto max-w-4xl text-center z-10">
          <Badge variant="success" className="mb-6 bg-pitch-green-500/10 border-pitch-green-500/30 px-3 py-1 text-data font-semibold tracking-wide animate-float">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pitch-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-pitch-green-500" />
            </span>
            FIFA World Cup 2026 — MetLife Stadium
          </Badge>

          <h1 className="font-display text-5xl font-extrabold leading-[1.15] tracking-tight text-text-primary md:text-7xl">
            Know the stadium.
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pitch-green-400 via-emerald-500 to-floodlight-200 text-glow-green">
              Every single second.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-body-lg leading-relaxed text-text-secondary">
            Real-time crowd density tracking, step-free wayfinding, PA broadcast translation, and a multilingual AI companion. Built for stadium commanders and fans in the stands.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate(user ? "/chat" : "/login")} className="shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:scale-103 transition-transform">
              {user ? "Open AI Companion" : "Get Started"} <ArrowRight size={16} />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => document.getElementById("dashboard-preview")?.scrollIntoView({ behavior: "smooth" })}>
              View Ops Dashboard
            </Button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="relative mt-20 grid w-full max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-fan border border-white/[0.08] bg-white/[0.05] backdrop-blur-md shadow-modal z-10 animate-float-delayed">
          {[
            { value: "82,500", label: "Monitored Seats" },
            { value: "< 30s", label: "Gemini Response" },
            { value: "6", label: "Supported Languages" },
          ].map((stat) => (
            <div key={stat.label} className="bg-pitch-surface/30 backdrop-blur-lg px-6 py-5 text-center transition-all hover:bg-white/[0.04]">
              <div className="font-display text-2xl font-bold text-floodlight-200 md:text-3xl">{stat.value}</div>
              <div className="mt-1 text-data font-medium text-text-muted uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="relative mx-auto max-w-7xl px-6 py-24 z-10">
        <div className="mb-16 max-w-2xl">
          <Badge variant="default" className="mb-4 bg-white/5 border border-white/10">What We Built</Badge>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-text-primary md:text-4xl">
            Two products. One stadium network.
          </h2>
          <p className="mt-3 text-body-lg text-text-secondary">
            A command center dashboard for ops managers, paired with an AI companion for fans, connected to a unified real-time telemetry stream.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid gap-5 md:grid-cols-3">
          {/* Big Card - spans 2 cols */}
          <div className="group relative overflow-hidden rounded-fan border border-white/[0.07] bg-pitch-surface/40 p-6 md:col-span-2 md:row-span-2 shadow-data hover:border-pitch-green-500/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)] transition-all duration-300">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pitch-green-500/[0.03] transition-transform duration-500 group-hover:scale-150" />
            <div className="relative">
              <Badge variant="success" className="mb-3 bg-pitch-green-500/10 border-pitch-green-500/30">Ops Dashboard</Badge>
              <h3 className="font-display text-2xl font-bold text-text-primary">Crowd intelligence in real time</h3>
              <p className="mt-2 text-body text-text-secondary">
                Live density mapping across every gate, section, and concourse. Automated incident tracking with Gemini-suggested evacuations and rerouting.
              </p>
            </div>
            <div className="relative mt-6 overflow-hidden rounded-data border border-white/[0.08] bg-pitch-night/80">
              <CrowdDensityWidget />
            </div>
          </div>

          {/* Tall Card */}
          <div className="group relative overflow-hidden rounded-fan border border-white/[0.07] bg-pitch-surface/40 p-6 shadow-data hover:border-pitch-green-500/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-fan bg-pitch-green-500/10 text-pitch-green-400 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <h3 className="font-display text-lg font-bold text-text-primary">Fan Companion</h3>
              <p className="mt-2 text-body text-text-secondary leading-relaxed">
                Multilingual AI helper answering stadium questions (gates, food options, transport schedules) in English, Spanish, French, German, Arabic, and Mandarin.
              </p>
            </div>
            <Link to="/chat" className="mt-4 text-data-md font-semibold text-pitch-green-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Ask AI Assistant &rarr;
            </Link>
          </div>

          {/* Regular Card */}
          <div className="group relative overflow-hidden rounded-fan border border-white/[0.07] bg-pitch-surface/40 p-6 shadow-data hover:border-pitch-green-500/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)] transition-all duration-300">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-fan bg-floodlight-200/10 text-floodlight-200 group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
            <h3 className="font-display text-lg font-bold text-text-primary">Transit Live Feed</h3>
            <p className="mt-2 text-body text-text-secondary leading-relaxed">
              NJ Transit Meadowlands Rail status, bus arrivals, rideshare waitlists, and vehicle traffic queues updated constantly.
            </p>
          </div>
        </div>

        {/* Modular Grid Link Cards */}
        <div className="mt-6 grid gap-5 md:grid-cols-4">
          {[
            {
              title: "Smart Wayfinding",
              desc: "Step-by-step directions with elevator, escalator, and wheelchair routes.",
              color: "text-blue-400 bg-blue-500/10 hover:border-blue-500/30",
              icon: <Navigation size={18} />,
              link: "/wayfinding"
            },
            {
              title: "Wait Time Predictor",
              desc: "AI concessions wait times calculated based on live stand crowd volumes.",
              color: "text-emerald-400 bg-emerald-500/10 hover:border-emerald-500/30",
              icon: <Clock size={18} />,
              link: "/chat"
            },
            {
              title: "Emergency PA Broadcast",
              desc: "Broadcast emergency announcements translated instantly into 6 languages.",
              color: "text-rose-400 bg-rose-500/10 hover:border-rose-500/30",
              icon: <Volume2 size={18} />,
              link: "/pa"
            },
            {
              title: "Post-Match Analytics",
              desc: "AI summaries on crowd exit speed, transit delays, and operational suggestions.",
              color: "text-purple-400 bg-purple-500/10 hover:border-purple-500/30",
              icon: <BarChart3 size={18} />,
              link: "/analytics"
            },
          ].map((f) => (
            <Link
              key={f.title}
              to={user ? f.link : "/login"}
              className={`group rounded-fan border border-white/[0.07] bg-pitch-surface/40 p-5 shadow-data transition-all hover:translate-y-[-2px] ${f.color}`}
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-fan bg-white/5 transition-transform group-hover:scale-105">
                {f.icon}
              </div>
              <h4 className="font-display text-body-lg font-semibold text-text-primary group-hover:text-text-primary transition-colors">
                {f.title}
              </h4>
              <p className="mt-1.5 text-body text-text-secondary leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative border-y border-white/[0.07] bg-white/[0.01] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <Badge variant="default" className="mb-4 bg-white/5 border border-white/10">Stadium Experience</Badge>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-text-primary">
              From arrival to seat to final whistle
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { num: "01", title: "Arrive Smart", desc: "Check Meadowlands rail status, parking lot capacity, and gate lines before leaving." },
              { num: "02", title: "Navigate Accessible", desc: "Get steps avoiding stairs, escalator status, and lift coordinates in real time." },
              { num: "03", title: "Ask Anything", desc: "Where is the nearest water refiller? What time is the next train? The assistant responds instantly." },
            ].map((step) => (
              <div key={step.num} className="relative p-6 rounded-fan border border-white/[0.04] bg-pitch-surface/20">
                <div className="font-display text-5xl font-extrabold text-pitch-green-500/10 mb-3">{step.num}</div>
                <h3 className="font-display text-lg font-bold text-text-primary">{step.title}</h3>
                <p className="mt-2 text-body text-text-secondary leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FULL DASHBOARD PREVIEW ─── */}
      <section id="dashboard-preview" className="relative mx-auto max-w-7xl px-6 py-24 z-10">
        <div className="mb-10">
          <Badge variant="success" className="mb-4 bg-pitch-green-500/10 border border-pitch-green-500/30">Live Ops preview</Badge>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-text-primary md:text-4xl">
            Command Center Dashboard
          </h2>
          <p className="mt-3 max-w-xl text-body-lg text-text-secondary">
            Operational dashboard layout updated constantly with sensor logs, fan reports, and transit delays.
          </p>
        </div>

        {/* Dashboard Widgets Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <CrowdDensityWidget />
          <IncidentFeed />
          <DecisionSupportPanel />
          <div className="lg:col-span-2 glass-card rounded-fan p-4 shadow-modal">
            <VenueMap selectedZone={selectedZone} onSelectZone={setSelectedZone} accessibleMode={accessibleMode} />
          </div>
          <TransitWidget />
          <div className="glass-card rounded-fan p-4 shadow-modal">
            <AccessibilityPanel accessibleMode={accessibleMode} onToggle={toggleAccessible} largeText={largeText} onToggleText={toggleLargeText} />
          </div>
          <SustainabilityWidget />
          <WaitTimeWidget />

          {/* Quick link blocks */}
          <Link to={user ? "/wayfinding" : "/login"} className="glass-card glass-card-hover rounded-fan p-6 flex flex-col items-center justify-center text-center">
            <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-fan bg-blue-500/10 text-blue-400">
              <Navigation size={20} />
            </div>
            <h4 className="font-display text-body-lg font-bold text-text-primary">Smart Wayfinding</h4>
            <p className="mt-1 text-data text-text-muted">Agnostic step-free navigation tool</p>
          </Link>
          <Link to={user ? "/pa" : "/login"} className="glass-card glass-card-hover rounded-fan p-6 flex flex-col items-center justify-center text-center">
            <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-fan bg-rose-500/10 text-rose-400">
              <Volume2 size={20} />
            </div>
            <h4 className="font-display text-body-lg font-bold text-text-primary">Emergency PA Broadcast</h4>
            <p className="mt-1 text-data text-text-muted">Broadcast translation panel</p>
          </Link>
          <Link to={user ? "/analytics" : "/login"} className="glass-card glass-card-hover rounded-fan p-6 flex flex-col items-center justify-center text-center">
            <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-fan bg-purple-500/10 text-purple-400">
              <BarChart3 size={20} />
            </div>
            <h4 className="font-display text-body-lg font-bold text-text-primary">Post-Match Analytics</h4>
            <p className="mt-1 text-data text-text-muted">AI generated match reviews</p>
          </Link>
        </div>
      </section>

      {/* ─── EVACUATION SIMULATOR ─── */}
      <section className="relative mx-auto max-w-7xl px-6 py-24 z-10">
        <div className="glass-card rounded-fan p-8 shadow-modal flex items-start gap-12 md:items-center md:flex-row flex-col border border-white/[0.08]">
          <div className="flex-1">
            <Badge variant="warning" className="mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-300">Interactive Simulation</Badge>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-text-primary md:text-4xl">
              Crowd Evacuation Simulator
            </h2>
            <p className="mt-3 text-body-lg text-text-secondary leading-relaxed">
              Inject custom fire hazards into a stadium model grid. Watch crowd agents run for safety while Gemini AI responders collaborate dynamically to clear pathways and reroute exits.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <Button size="lg" onClick={() => navigate(user ? "/evacuation" : "/login")} className="shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                Launch Simulator
              </Button>
              <div className="flex items-center gap-4 text-data text-text-muted">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400" /> Agents</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" /> Fire</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> AI Responders</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full bg-white/[0.02] rounded-fan border border-white/[0.05] p-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "300", desc: "Agent Nodes", color: "text-blue-400" },
                { label: "3", desc: "AI Controllers", color: "text-floodlight-200" },
                { label: "20 Hz", desc: "Sim ticks", color: "text-pitch-green-400" },
                { label: "Gemini", desc: "Brain Model", color: "text-purple-400" },
                { label: "Dynamic", desc: "A* Pathfinding", color: "text-amber-500" },
                { label: "Live", desc: "SSE Data feed", color: "text-text-primary" },
              ].map((s) => (
                <div key={s.label} className="rounded-data bg-white/[0.04] p-3 text-center border border-white/[0.04] hover:bg-white/[0.06] transition-colors">
                  <div className={`font-display text-lg font-bold ${s.color}`}>{s.label}</div>
                  <div className="text-data font-medium text-text-muted mt-0.5">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER CTA ─── */}
      <section className="relative px-6 py-24 overflow-hidden border-t border-white/[0.07] bg-white/[0.01]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-[300px] w-[300px] rounded-full bg-pitch-green-500/[0.03] blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center z-10">
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-text-primary md:text-5xl">
            Ready for kickoff?
          </h2>
          <p className="mt-4 text-body-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
            Create an account or sign in to experience StadiumSense modules during FIFA matches.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => navigate(user ? "/chat" : "/login")} className="shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              {user ? "Open Assistant Companion" : "Create Free Account"}
            </Button>
          </div>
        </div>
      </section>

      {/* ─── GLOBAL FOOTER ─── */}
      <Footer />
    </div>
  );
}
