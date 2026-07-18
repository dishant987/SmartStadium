import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { LogOut, ArrowLeft, User, Mail, ShieldAlert } from "lucide-react";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate("/login");
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

      {/* Glassmorphic Profile Card */}
      <div className="glass-card w-full max-w-md p-8 rounded-fan border border-white/[0.08] shadow-modal relative z-10 animate-float">
        <div className="mb-6 flex items-center justify-between border-b border-white/[0.05] pb-4">
          <h1 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
            <User size={18} className="text-pitch-green-400" /> Operator Profile
          </h1>
          <span className="rounded-full bg-pitch-green-500/10 border border-pitch-green-500/30 px-2.5 py-0.5 text-data font-semibold text-pitch-green-400">
            Active
          </span>
        </div>

        <div className="flex flex-col items-center gap-6">
          {/* Operator Avatar */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pitch-green-400 to-floodlight-200 blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pitch-green-500 to-emerald-600 text-pitch-night shadow-modal">
              <User size={36} className="text-white" />
            </div>
          </div>

          {/* User details */}
          <div className="w-full space-y-3 bg-white/[0.02] border border-white/[0.04] rounded-fan p-4">
            <div className="flex items-center gap-3">
              <User size={16} className="text-text-muted" />
              <div>
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Full Name</p>
                <p className="text-body font-semibold text-text-primary mt-0.5">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-white/[0.03] pt-3">
              <Mail size={16} className="text-text-muted" />
              <div>
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Email Address</p>
                <p className="text-body font-semibold text-text-primary mt-0.5">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-white/[0.03] pt-3">
              <ShieldAlert size={16} className="text-text-muted" />
              <div>
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Access Scope</p>
                <p className="text-body font-semibold text-floodlight-200 mt-0.5">FIFA MetLife Commander</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full pt-2 flex flex-col gap-2.5">
            <Button variant="secondary" onClick={() => navigate("/")} className="w-full">
              Go to Command Center
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="w-full flex items-center justify-center gap-2">
              <LogOut size={16} /> Sign Out Operator
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
