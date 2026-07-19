import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { UserPlus, ArrowLeft } from "lucide-react";
import { createVolunteer } from "@/services/volunteer";

const ROLES = [
  { value: "gate_ops", label: "Gate Operations", desc: "Check tickets and manage entry flow" },
  { value: "concierge", label: "Concierge", desc: "Staff Guest Services and answer questions" },
  { value: "transit_support", label: "Transit Support", desc: "Assist at transit platforms and shuttles" },
  { value: "accessibility", label: "Accessibility Assistance", desc: "Help fans with disabilities" },
  { value: "emergency_response", label: "Emergency Response", desc: "First aid and evacuation support" },
];

export function VolunteerRegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("concierge");
  const [zone, setZone] = useState("");
  const [languages, setLanguages] = useState("en");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await createVolunteer({ name: name.trim(), role, zone: zone || undefined, languages: languages || "en", phone: phone || undefined });
      navigate("/volunteer");
    } catch {
      // ponytail: silent catch
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-pitch-night text-text-primary font-ui">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <button onClick={() => navigate("/volunteer")} className="flex items-center gap-1.5 text-data text-text-muted hover:text-text-primary mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Command Center
        </button>

        <Badge variant="success" className="mb-3 bg-pitch-green-500/10 border border-pitch-green-500/30">
          <UserPlus size={12} /> Volunteer Registration
        </Badge>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl mb-2">
          Register Volunteer
        </h1>
        <p className="text-body text-text-secondary mb-8">Add a new volunteer to the FIFA World Cup 2026 match-day roster.</p>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 space-y-6">
            <div>
              <label className="block text-data font-semibold text-text-primary mb-1.5">Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-data border border-white/[0.1] bg-white/[0.03] px-3.5 py-2.5 text-body text-text-primary placeholder-text-muted outline-none focus:border-pitch-green-500/50 transition-colors"
                placeholder="e.g. Alex Johnson" required />
            </div>

            <div>
              <label className="block text-data font-semibold text-text-primary mb-1.5">Role</label>
              <div className="grid gap-2">
                {ROLES.map((r) => (
                  <label key={r.value}
                    className={`flex items-start gap-3 p-3 rounded-data border cursor-pointer transition-all ${
                      role === r.value
                        ? "border-pitch-green-500/40 bg-pitch-green-500/10"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                    onClick={() => setRole(r.value)}
                  >
                    <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} className="mt-1 accent-pitch-green-400" />
                    <div>
                      <div className="text-body font-semibold text-text-primary">{r.label}</div>
                      <div className="text-data text-text-muted">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-data font-semibold text-text-primary mb-1.5">Assigned Zone (optional)</label>
              <select value={zone} onChange={(e) => setZone(e.target.value)}
                className="w-full rounded-data border border-white/[0.1] bg-white/[0.03] px-3.5 py-2.5 text-body text-text-primary outline-none focus:border-pitch-green-500/50 transition-colors">
                <option value="">Auto-assign</option>
                <option value="z1">Main Stand</option>
                <option value="z2">East Stand</option>
                <option value="z3">West Stand</option>
                <option value="z4">South Plaza</option>
                <option value="z5">Fan Zone</option>
              </select>
            </div>

            <div>
              <label className="block text-data font-semibold text-text-primary mb-1.5">Languages (comma-separated)</label>
              <input type="text" value={languages} onChange={(e) => setLanguages(e.target.value)}
                className="w-full rounded-data border border-white/[0.1] bg-white/[0.03] px-3.5 py-2.5 text-body text-text-primary placeholder-text-muted outline-none focus:border-pitch-green-500/50 transition-colors"
                placeholder="en, es, fr" />
            </div>

            <div>
              <label className="block text-data font-semibold text-text-primary mb-1.5">Phone (optional)</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-data border border-white/[0.1] bg-white/[0.03] px-3.5 py-2.5 text-body text-text-primary placeholder-text-muted outline-none focus:border-pitch-green-500/50 transition-colors"
                placeholder="+1 (555) 123-4567" />
            </div>

            <Button type="submit" disabled={!name.trim() || submitting} className="w-full">
              {submitting ? "Registering..." : "Register Volunteer"}
            </Button>
          </Card>
        </form>
      </div>
      <Footer />
    </div>
  );
}
