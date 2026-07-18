import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/chat" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) { setError("Email and password required"); return; }
    if (mode === "register" && !name.trim()) { setError("Name required"); return; }
    setLoading(true);
    try {
      if (mode === "register") {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      navigate("/chat");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-pitch-night px-6 overflow-hidden">
      {/* Moving Grid overlay */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-15" />

      {/* Floating Glowing Blobs */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute left-1/3 top-1/3 h-[300px] w-[300px] rounded-full bg-pitch-green-500/[0.04] blur-[80px] animate-pulse-glow" />
        <div className="absolute right-1/3 bottom-1/3 h-[300px] w-[300px] rounded-full bg-floodlight-200/[0.03] blur-[80px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>

      {/* Back to Home Link */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] backdrop-blur-md px-3.5 py-1.5 text-data-md font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
      >
        <ArrowLeft size={14} /> Back to Home
      </Link>

      {/* Glassmorphic Form Card */}
      <div className="glass-card w-full max-w-sm p-8 rounded-fan border border-white/[0.08] shadow-modal relative z-10 animate-float">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-fan bg-gradient-to-br from-pitch-green-400 to-floodlight-200 text-xs font-bold text-pitch-night shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            SS
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Stadium<span className="text-pitch-green-400">Sense</span>
          </h1>
          <p className="mt-1 font-ui text-data-md text-text-muted">
            {mode === "login" ? "Sign in to access dashboard modules" : "Create your credentials to continue"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1">
              <Input 
                label="Full Name" 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Name" 
                className="bg-pitch-night/50 border-white/[0.08] text-text-primary placeholder:text-text-muted focus:border-pitch-green-500/50"
              />
            </div>
          )}
          <div className="space-y-1">
            <Input 
              label="Email Address" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@domain.com"
              className="bg-pitch-night/50 border-white/[0.08] text-text-primary placeholder:text-text-muted focus:border-pitch-green-500/50"
            />
          </div>
          <div className="space-y-1">
            <Input 
              label="Secret Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              className="bg-pitch-night/50 border-white/[0.08] text-text-primary placeholder:text-text-muted focus:border-pitch-green-500/50"
            />
          </div>

          {error && (
            <div className="rounded-data border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-data text-rose-400 flex items-center gap-1.5">
              <ShieldCheck size={12} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:scale-[1.01] transition-transform" disabled={loading}>
            {loading ? "Processing..." : mode === "login" ? "Sign In" : "Register Credentials"}
          </Button>
        </form>

        <div className="mt-6 border-t border-white/[0.05] pt-4 text-center">
          <p className="font-ui text-data-md text-text-muted">
            {mode === "login" ? (
              <>
                New operator?{" "}
                <button 
                  onClick={() => { setMode("register"); setError(""); }} 
                  className="text-pitch-green-400 hover:underline hover:text-pitch-green-300 font-medium transition-colors"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Have account?{" "}
                <button 
                  onClick={() => { setMode("login"); setError(""); }} 
                  className="text-pitch-green-400 hover:underline hover:text-pitch-green-300 font-medium transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
