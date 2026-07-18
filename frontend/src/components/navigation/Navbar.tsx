import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  MessageSquare,
  Navigation as NavIcon,
  ShieldAlert,
  Volume2,
  BarChart3,
  Users
} from "lucide-react";



export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Scroll Spy to highlight active section
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    const sections = ["features", "dashboard-preview"];
    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -50% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      if (window.scrollY < 200) {
        setActiveSection("home");
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  // Handle hash scrolling when navigating from other pages
  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const id = location.hash.slice(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  }, [location.pathname, location.hash]);

  // Close dropdowns on route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
      setIsOpen(false);
    }
  };

  const tools = [
    {
      name: "AI Companion",
      desc: "Multilingual fan chatbot support",
      path: "/chat",
      icon: MessageSquare,
      color: "text-emerald-400 bg-emerald-500/10",
      requiresAuth: true
    },
    {
      name: "Smart Wayfinding",
      desc: "Step-free & accessible routing",
      path: "/wayfinding",
      icon: NavIcon,
      color: "text-blue-400 bg-blue-500/10",
      requiresAuth: true
    },
    {
      name: "Evacuation Simulator",
      desc: "Gemini hazard agent simulation",
      path: "/evacuation",
      icon: ShieldAlert,
      color: "text-rose-400 bg-rose-500/10",
      requiresAuth: true
    },
    {
      name: "Emergency PA Broadcast",
      desc: "Multi-language audio translation",
      path: "/pa",
      icon: Volume2,
      color: "text-amber-400 bg-amber-500/10",
      requiresAuth: true
    },
    {
      name: "Post-Match Analytics",
      desc: "AI report on crowd and transit",
      path: "/analytics",
      icon: BarChart3,
      color: "text-purple-400 bg-purple-500/10",
      requiresAuth: true
    },
    {
      name: "Volunteer Ops",
      desc: "Manage volunteer shifts & tasks",
      path: "/volunteer",
      icon: Users,
      color: "text-teal-400 bg-teal-500/10",
      requiresAuth: true
    }
  ];

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 w-full px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        {/* Left Island: Logo */}
        <div className="pointer-events-auto flex h-11 items-center rounded-full border border-white/[0.08] bg-pitch-night/85 px-4 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-white/[0.15]">
          <Link to="/" className="flex items-center gap-2 group">
            <svg className="h-5 w-5 text-pitch-green-400 animate-[spin_12s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite] transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
            <span className="font-display text-sm font-extrabold uppercase tracking-widest text-text-primary flex items-center gap-1.5">
              Stadium<span className="text-pitch-green-400 bg-pitch-green-500/10 px-1.5 py-0.5 rounded text-[10px] tracking-normal font-bold border border-pitch-green-400/20 text-glow-green">SENSE</span>
            </span>
          </Link>
        </div>

        {/* Middle Island: Navigation */}
        <div className="hidden md:flex pointer-events-auto h-11 items-center gap-6 rounded-full border border-white/[0.08] bg-pitch-night/85 px-6 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-white/[0.15]">
          <Link
            to="/"
            className={`text-xs uppercase tracking-wider font-semibold transition-colors hover:text-white ${location.pathname === "/" && activeSection === "home" ? "text-pitch-green-400" : "text-text-secondary"
              }`}
          >
            Home
          </Link>

          <Link
            to="/#features"
            onClick={(e) => handleAnchorClick(e, "features")}
            className={`text-xs uppercase tracking-wider font-semibold transition-colors hover:text-white ${location.pathname === "/" && activeSection === "features" ? "text-pitch-green-400" : "text-text-secondary"
              }`}
          >
            Features
          </Link>

          <Link
            to="/#dashboard-preview"
            onClick={(e) => handleAnchorClick(e, "dashboard-preview")}
            className={`text-xs uppercase tracking-wider font-semibold transition-colors hover:text-white ${location.pathname === "/" && activeSection === "dashboard-preview" ? "text-pitch-green-400" : "text-text-secondary"
              }`}
          >
            Dashboard
          </Link>

          {/* Stadium Modules Dropdown */}
          <div className="relative group py-2">
            <button
              aria-haspopup="true"
              aria-expanded="false"
              onFocus={() => {}}
              className={`text-xs uppercase tracking-wider font-semibold transition-colors group-hover:text-white group-focus-within:text-white flex items-center gap-1 outline-none ${tools.some(t => location.pathname.startsWith(t.path)) ? "text-pitch-green-400" : "text-text-secondary"
                }`}
            >
              Modules <ChevronDown size={12} className="transition-transform duration-200 text-text-muted group-hover:rotate-180 group-focus-within:rotate-180" />
            </button>

            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-80 opacity-0 translate-y-1 scale-95 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:pointer-events-auto transition-all duration-200 ease-out z-50">
              <div className="rounded-fan border border-white/[0.08] bg-[#080d1b]/95 p-2 shadow-modal backdrop-blur-2xl">
                <div className="px-3 py-2 border-b border-white/[0.05] mb-1">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Stadium Operations
                  </p>
                </div>
                <div className="space-y-1">
                  {tools.map((item) => {
                    const Icon = item.icon;
                    const isSelected = location.pathname.startsWith(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={user || !item.requiresAuth ? item.path : "/login"}
                        className={`flex items-start gap-3 rounded-fan p-2.5 transition-all hover:bg-white/[0.04] ${isSelected ? "bg-white/[0.03] border-l-2 border-pitch-green-400" : ""
                          }`}
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-fan ${item.color}`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-body font-semibold text-text-primary">{item.name}</p>
                          <p className="text-[11px] text-text-muted mt-0.5">{item.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Island: Action / Profile */}
        <div className="pointer-events-auto flex h-11 items-center gap-3 rounded-full border border-white/[0.08] bg-pitch-night/85 px-4 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-white/[0.15]">
          {user ? (
            <div className="relative flex items-center group py-2">
              <button
                aria-haspopup="true"
                aria-expanded="false"
                onFocus={() => {}}
                className="flex items-center gap-2 text-xs font-semibold text-text-primary group-hover:text-white group-focus-within:text-white transition-all outline-none"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pitch-green-400 text-pitch-night text-[10px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                <ChevronDown size={12} className="transition-transform duration-200 text-text-muted group-hover:rotate-180 group-focus-within:rotate-180" />
              </button>

              <div className="absolute right-0 top-full pt-3 w-56 opacity-0 translate-y-1 scale-95 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:pointer-events-auto transition-all duration-200 ease-out z-50">
                <div className="rounded-fan border border-white/[0.08] bg-pitch-night/95 p-2 shadow-modal backdrop-blur-2xl">
                  <div className="px-3 py-2 border-b border-white/[0.05] mb-1">
                    <p className="text-body font-semibold text-text-primary truncate">{user.name}</p>
                    <p className="text-data text-text-muted truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="space-y-0.5">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 rounded-fan px-3 py-2 text-body text-text-secondary hover:bg-white/[0.04] hover:text-text-primary transition-all"
                    >
                      <User size={14} /> My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-fan px-3 py-2 text-body text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="text-xs font-semibold text-text-secondary hover:text-white transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate("/login")}
                className="rounded-full bg-pitch-green-500 hover:bg-pitch-green-400 px-3.5 py-1.5 text-xs font-semibold text-pitch-night transition-all shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              >
                Get started
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden border-l border-white/[0.08] pl-2.5 ml-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center text-text-secondary hover:text-white outline-none transition-all"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden" onClick={() => setIsOpen(false)} />
          <div className="absolute top-16 right-4 sm:right-6 left-4 sm:left-auto sm:w-80 origin-top rounded-3xl border border-white/[0.08] bg-[#080d1b]/95 p-4 shadow-modal backdrop-blur-2xl z-50 pointer-events-auto animate-mobile-reveal">
            <div className="space-y-1">
              <Link
                to="/"
                className={`block rounded-xl px-3 py-2 text-body font-medium transition-all ${location.pathname === "/" && activeSection === "home" ? "bg-white/[0.04] text-pitch-green-400 font-semibold" : "text-text-secondary"
                  }`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>

              <Link
                to="/#features"
                onClick={(e) => { handleAnchorClick(e, "features"); setIsOpen(false); }}
                className={`block rounded-xl px-3 py-2 text-body font-medium transition-all ${location.pathname === "/" && activeSection === "features" ? "bg-white/[0.04] text-pitch-green-400 font-semibold" : "text-text-secondary"
                  }`}
              >
                Features
              </Link>

              <Link
                to="/#dashboard-preview"
                onClick={(e) => { handleAnchorClick(e, "dashboard-preview"); setIsOpen(false); }}
                className={`block rounded-xl px-3 py-2 text-body font-medium transition-all ${location.pathname === "/" && activeSection === "dashboard-preview" ? "bg-white/[0.04] text-pitch-green-400 font-semibold" : "text-text-secondary"
                  }`}
              >
                Ops Dashboard
              </Link>

              {/* Mobile Modules Section */}
              <div className="pt-2 border-t border-white/[0.05] mt-2">
                <p className="px-3 text-data font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                  Stadium Modules
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {tools.map((item) => {
                    const Icon = item.icon;
                    const isSelected = location.pathname.startsWith(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={user || !item.requiresAuth ? item.path : "/login"}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-body transition-all ${isSelected ? "bg-white/[0.04] text-pitch-green-400 font-semibold" : "text-text-secondary hover:text-text-primary"
                          }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon size={16} className={item.color.split(" ")[0]} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile User Section */}
              <div className="border-t border-white/[0.05] pt-3 mt-3">
                {user ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-1.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pitch-green-400 text-pitch-night font-bold font-display">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-body font-semibold text-text-primary truncate">{user.name}</p>
                        <p className="text-data text-text-muted truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="block rounded-xl px-3 py-2 text-body text-text-secondary hover:bg-white/[0.04] transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-body text-rose-400 hover:bg-rose-500/10 transition-all text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 px-3 pt-1">
                    <Button variant="secondary" size="sm" onClick={() => { navigate("/login"); setIsOpen(false); }} className="w-full">
                      Sign In
                    </Button>
                    <Button size="sm" onClick={() => { navigate("/login"); setIsOpen(false); }} className="w-full">
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
