import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Users, ClipboardList, MapPin, Phone, Globe,
  CheckCircle,
  UserPlus, RefreshCw
} from "lucide-react";
import type { VolunteerDashboard, Volunteer, VolunteerTask } from "@/services/volunteer";
import { fetchVolunteerDashboard, updateVolunteerStatus, updateTask } from "@/services/volunteer";

const ROLE_LABELS: Record<string, string> = {
  gate_ops: "Gate Ops", concierge: "Concierge",
  transit_support: "Transit Support", accessibility: "Accessibility",
  emergency_response: "Emergency Response",
};
const STATUS_COLORS: Record<string, string> = {
  available: "text-pitch-green-400 bg-pitch-green-500/10",
  on_shift: "text-blue-400 bg-blue-500/10",
  on_break: "text-amber-400 bg-amber-500/10",
  off_duty: "text-text-muted bg-white/5",
};
const PRIORITY_COLORS: Record<string, string> = {
  high: "text-alert-red bg-alert-red/10",
  medium: "text-amber-400 bg-amber-500/10",
  low: "text-pitch-green-400 bg-pitch-green-500/10",
};

export function VolunteerPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<VolunteerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"volunteers" | "tasks">("volunteers");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchVolunteerDashboard();
      setDashboard(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    await updateVolunteerStatus(id, { status });
    load();
  };

  const handleTaskStatus = async (id: string, status: string) => {
    await updateTask(id, { status });
    load();
  };

  return (
    <div className="min-h-screen bg-pitch-night text-text-primary font-ui">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <Badge variant="success" className="mb-3 bg-pitch-green-500/10 border border-pitch-green-500/30">
              <Users size={12} /> Volunteer Operations
            </Badge>
            <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Command Center
            </h1>
            <p className="mt-1 text-body text-text-secondary">
              Manage volunteer shifts, assignments, and real-time tasks
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </Button>
            <Button size="sm" onClick={() => navigate("/volunteer/register")}>
              <UserPlus size={14} /> Add Volunteer
            </Button>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid gap-4 mb-8 grid-cols-2 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="text-center p-5 space-y-2">
                <Skeleton className="h-8 w-16 mx-auto rounded" />
                <Skeleton className="h-3.5 w-24 mx-auto rounded" />
              </Card>
            ))}
          </div>
        ) : dashboard ? (
          <div className="grid gap-4 mb-8 grid-cols-2 md:grid-cols-4">
            <Card className="text-center p-5">
              <div className="font-display text-2xl font-bold text-text-primary">{dashboard.total}</div>
              <div className="text-data text-text-muted mt-1">Total Volunteers</div>
            </Card>
            <Card className="text-center p-5 border-blue-500/20">
              <div className="font-display text-2xl font-bold text-blue-400">{dashboard.on_shift}</div>
              <div className="text-data text-text-muted mt-1">On Shift</div>
            </Card>
            <Card className="text-center p-5 border-pitch-green-500/20">
              <div className="font-display text-2xl font-bold text-pitch-green-400">{dashboard.available}</div>
              <div className="text-data text-text-muted mt-1">Available</div>
            </Card>
            <Card className="text-center p-5 border-amber-500/20">
              <div className="font-display text-2xl font-bold text-amber-400">{dashboard.active_tasks}</div>
              <div className="text-data text-text-muted mt-1">Active Tasks</div>
            </Card>
          </div>
        ) : null}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-fan bg-white/[0.03] border border-white/[0.06] w-fit" role="tablist">
          {(["volunteers", "tasks"] as const).map((tab) => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              role="tab"
              aria-selected={activeTab === tab}
              className={`px-4 py-2 rounded-fan text-data font-semibold transition-all capitalize ${
                activeTab === tab ? "bg-pitch-green-500/20 text-pitch-green-400" : "text-text-secondary hover:text-text-primary"
              }`}
            >{tab}</button>
          ))}
        </div>

        {loading ? (
          activeTab === "volunteers" ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-5 space-y-4 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-5 w-2/3 rounded" />
                      <Skeleton className="h-3 w-1/3 rounded" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-3.5 w-1/2 rounded" />
                    <Skeleton className="h-3.5 w-1/3 rounded" />
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-white/[0.05]">
                    <Skeleton className="h-7 w-20 rounded" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-4 flex flex-wrap items-start gap-4 animate-pulse">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-4 w-14 rounded" />
                    </div>
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded shrink-0" />
                </Card>
              ))}
            </div>
          )
        ) : !dashboard ? (
          <div className="text-center py-20 text-text-muted">Failed to load data</div>
        ) : activeTab === "volunteers" ? (
          <VolunteerListView volunteers={dashboard.volunteers} onStatusChange={handleStatusChange} />
        ) : (
          <TaskListView tasks={dashboard.tasks} onStatusChange={handleTaskStatus} />
        )}
      </div>
      <Footer />
    </div>
  );
}

function VolunteerListView({ volunteers, onStatusChange }: { volunteers: Volunteer[]; onStatusChange: (id: string, status: string) => void }) {
  if (!volunteers.length) {
    return (
      <Card className="text-center py-16">
        <Users size={40} className="mx-auto text-text-muted mb-4" />
        <h3 className="font-display text-lg font-bold">No volunteers yet</h3>
        <p className="text-text-muted text-body mt-1">Register the first volunteer to get started.</p>
      </Card>
    );
  }
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {volunteers.map((v) => (
        <Card key={v.id} className="p-5 hover:border-pitch-green-500/20 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-display font-bold text-text-primary">{v.name}</h3>
              <p className="text-data text-text-muted">{ROLE_LABELS[v.role] || v.role}</p>
            </div>
            <span className={`text-data font-semibold px-2 py-0.5 rounded-pill ${STATUS_COLORS[v.status] || ""}`}>
              {v.status.replace("_", " ")}
            </span>
          </div>
          <div className="space-y-1.5 text-data text-text-secondary">
            {v.zone && <span className="flex items-center gap-1.5"><MapPin size={12} /> Zone {v.zone.toUpperCase()}</span>}
            {v.languages && <span className="flex items-center gap-1.5"><Globe size={12} /> {v.languages}</span>}
            {v.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {v.phone}</span>}
          </div>
          <div className="flex gap-1.5 mt-4 pt-3 border-t border-white/[0.05]">
            {v.status === "available" && (
              <Button size="sm" onClick={() => onStatusChange(v.id, "on_shift")} className="text-xs py-1 px-2">Start Shift</Button>
            )}
            {v.status === "on_shift" && (
              <Button size="sm" variant="secondary" onClick={() => onStatusChange(v.id, "on_break")} className="text-xs py-1 px-2">Break</Button>
            )}
            {v.status === "on_break" && (
              <Button size="sm" onClick={() => onStatusChange(v.id, "on_shift")} className="text-xs py-1 px-2">Resume</Button>
            )}
            {(v.status === "on_shift" || v.status === "on_break") && (
              <Button size="sm" variant="secondary" onClick={() => onStatusChange(v.id, "off_duty")} className="text-xs py-1 px-2 text-rose-400">End Shift</Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function TaskListView({ tasks, onStatusChange }: { tasks: VolunteerTask[]; onStatusChange: (id: string, status: string) => void }) {
  if (!tasks.length) {
    return (
      <Card className="text-center py-16">
        <ClipboardList size={40} className="mx-auto text-text-muted mb-4" />
        <h3 className="font-display text-lg font-bold">No tasks assigned</h3>
        <p className="text-text-muted text-body mt-1">AI-generated tasks will appear here during match day.</p>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {tasks.map((t) => (
        <Card key={t.id} className="p-4 flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-data font-semibold px-2 py-0.5 rounded-pill ${PRIORITY_COLORS[t.priority] || ""}`}>{t.priority}</span>
              <span className="text-data font-medium text-text-muted">{t.task_type.replace("_", " ")}</span>
              <span className={`text-data font-semibold capitalize ${t.status === "completed" ? "text-pitch-green-400" : t.status === "in_progress" ? "text-blue-400" : "text-text-muted"}`}>
                {t.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-body text-text-primary">{t.description}</p>
            {t.zone && <p className="text-data text-text-muted mt-1"><MapPin size={12} className="inline" /> Zone {t.zone.toUpperCase()}</p>}
          </div>
          <div className="flex gap-1.5 shrink-0">
            {t.status === "assigned" && (
              <Button size="sm" onClick={() => onStatusChange(t.id, "in_progress")} className="text-xs py-1 px-2">Accept</Button>
            )}
            {t.status === "in_progress" && (
              <Button size="sm" onClick={() => onStatusChange(t.id, "completed")} className="text-xs py-1 px-2">
                <CheckCircle size={12} /> Complete
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
