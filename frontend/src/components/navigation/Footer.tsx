import { Link } from "react-router-dom";
import { ShieldAlert, Heart, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.07] bg-pitch-night/80 backdrop-blur-md">
      {/* Decorative Top Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pitch-green-500/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group">
              <svg className="h-5 w-5 text-pitch-green-400 animate-[spin_16s_linear_infinite] group-hover:animate-[spin_4s_linear_infinite] transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" />
                <polygon points="12,9 14.5,11 13.5,14 10.5,14 9.5,11" fill="currentColor" stroke="currentColor" strokeWidth="1" />
                <line x1="12" y1="9" x2="12" y2="2" stroke="currentColor" />
                <line x1="14.5" y1="11" x2="21.5" y2="8.5" stroke="currentColor" />
                <line x1="13.5" y1="14" x2="18" y2="20.5" stroke="currentColor" />
                <line x1="10.5" y1="14" x2="6" y2="20.5" stroke="currentColor" />
                <line x1="9.5" y1="11" x2="2.5" y2="8.5" stroke="currentColor" />
                <line x1="12" y1="2" x2="17.5" y2="4" stroke="currentColor" />
                <line x1="12" y1="2" x2="6.5" y2="4" stroke="currentColor" />
                <line x1="21.5" y1="8.5" x2="17.5" y2="4" stroke="currentColor" />
                <line x1="21.5" y1="8.5" x2="22" y2="14" stroke="currentColor" />
                <line x1="18" y1="20.5" x2="22" y2="14" stroke="currentColor" />
                <line x1="18" y1="20.5" x2="12" y2="22" stroke="currentColor" />
                <line x1="6" y1="20.5" x2="12" y2="22" stroke="currentColor" />
                <line x1="6" y1="20.5" x2="2" y2="14" stroke="currentColor" />
                <line x1="2.5" y1="8.5" x2="2" y2="14" stroke="currentColor" />
                <line x1="2.5" y1="8.5" x2="6.5" y2="4" stroke="currentColor" />
              </svg>
              <span className="font-display text-xs font-extrabold uppercase tracking-widest text-text-primary flex items-center gap-1">
                Stadium<span className="text-pitch-green-400 bg-pitch-green-500/10 px-1 py-0.5 rounded text-[9px] tracking-normal font-bold border border-pitch-green-400/20">SENSE</span>
              </span>
            </Link>
            <p className="mt-3 text-data-md text-text-muted leading-relaxed">
              Real-time crowd intelligence, smart wayfinding, and incident simulation for the FIFA World Cup 2026.
            </p>
          </div>

          {/* Module Quick Links */}
          <div>
            <h4 className="mb-3.5 text-xs font-semibold text-text-primary uppercase tracking-wider">
              Modules
            </h4>
            <ul className="space-y-2 text-data-md text-text-secondary">
              <li>
                <Link to="/chat" className="hover:text-pitch-green-400 transition-colors flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-pitch-green-400" /> AI Companion
                </Link>
              </li>
              <li>
                <Link to="/wayfinding" className="hover:text-pitch-green-400 transition-colors flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-blue-400" /> Smart Wayfinding
                </Link>
              </li>
              <li>
                <Link to="/evacuation" className="hover:text-pitch-green-400 transition-colors flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-rose-400" /> Evacuation Sim
                </Link>
              </li>
              <li>
                <Link to="/pa" className="hover:text-pitch-green-400 transition-colors flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-amber-400" /> Emergency PA
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-pitch-green-400 transition-colors flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-purple-400" /> Post-Match Analytics
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="hover:text-pitch-green-400 transition-colors flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-teal-400" /> Volunteer Operations
                </Link>
              </li>
            </ul>
          </div>

          {/* Venue Info */}
          <div>
            <h4 className="mb-3.5 text-xs font-semibold text-text-primary uppercase tracking-wider">
              MetLife Venue
            </h4>
            <ul className="space-y-2 text-data-md text-text-secondary">
              <li className="flex items-center gap-1.5 text-text-muted">
                <span>East Rutherford, NJ</span>
              </li>
              <li className="flex items-center gap-1.5 text-text-muted">
                <span>Capacity: 82,500</span>
              </li>
              <li className="flex items-center gap-1.5 text-text-muted">
                <span>Matches: 8 (inc. Final)</span>
              </li>
              <li>
                <a 
                  href="#dashboard-preview" 
                  className="text-floodlight-200 hover:underline hover:text-floodlight-100 transition-colors"
                >
                  View live ops stats &rarr;
                </a>
              </li>
            </ul>
          </div>

          {/* System Status */}
          <div>
            <h4 className="mb-3.5 text-xs font-semibold text-text-primary uppercase tracking-wider">
              System Health
            </h4>
            <div className="rounded-fan border border-white/[0.05] bg-white/[0.02] p-3 space-y-2">
              <div className="flex items-center justify-between text-data">
                <span className="text-text-muted">Security API</span>
                <span className="text-pitch-green-400 font-medium">99.98%</span>
              </div>
              <div className="flex items-center justify-between text-data">
                <span className="text-text-muted">Gemini Latency</span>
                <span className="text-pitch-green-400 font-medium">&lt; 400ms</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted border-t border-white/[0.05] pt-2 mt-2">
                <span className="h-2 w-2 rounded-full bg-pitch-green-400 animate-pulse" />
                <span>All core pipelines active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and project notes */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.05] pt-6 text-data text-text-muted md:flex-row">
          <div className="flex items-center gap-1">
            <span>&copy; 2026 StadiumSense. Built with</span>
            <Heart size={10} className="text-rose-500 fill-rose-500 animate-pulse" />
            <span>for FIFA World Cup Hackathon.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px]">
              FIFA World Cup 2026 Final Host
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
