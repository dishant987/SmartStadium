import { useState, memo } from "react";
import { AlertTriangle, Plus, AlertCircle, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIncidents, useReportIncident } from "@/hooks/useIncidents";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";

const schema = z.object({
  severity: z.enum(["low", "medium", "high"]),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
});

type FormData = z.infer<typeof schema>;

const statusConfig = {
  low: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-500",
    border: "border-emerald-500/20",
  },
  medium: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    dot: "bg-amber-500",
    border: "border-amber-500/20",
  },
  high: {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    dot: "bg-rose-500",
    border: "border-rose-500/20",
  },
} as const;

export const IncidentFeed = memo(function IncidentFeed() {
  const { data, isLoading } = useIncidents();
  const { mutate: report, isPending } = useReportIncident();
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (d: FormData) => {
    report(d, {
      onSuccess: () => {
        addToast("Incident reported successfully", "success");
        setOpen(false);
        reset();
      },
      onError: () => addToast("Failed to report incident", "error"),
    });
  };

  return (
    <>
      <Card variant="data" className="p-4 flex flex-col justify-between h-full">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                <AlertTriangle size={15} />
              </div>
              <h3 className="font-display text-h3 font-semibold text-text-primary">
                Active Incidents
              </h3>
            </div>
            <Button size="sm" onClick={() => setOpen(true)} className="h-7 px-3 text-[11px] font-bold">
              <Plus size={12} className="mr-1" /> Report
            </Button>
          </div>

          <div className="space-y-2 max-h-[268px] overflow-y-auto pr-1 flex-1">
            {isLoading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)
            ) : !data || data.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-xs text-text-muted font-ui">No active incidents reported</span>
              </div>
            ) : (
              data.map((inc) => {
                const cfg = statusConfig[inc.severity] || statusConfig.low;
                return (
                  <div
                    key={inc.id}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-[#0c1222]/40 p-3 hover:bg-[#0c1222]/80 transition-colors"
                  >
                    <div className="mt-0.5 shrink-0">
                      <AlertCircle size={15} className={cfg.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate font-ui text-xs font-bold text-text-primary">
                          {inc.category}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                          <span className={`h-1 w-1 rounded-full ${cfg.dot}`} />
                          {inc.severity}
                        </span>
                      </div>
                      <p className="mt-1 font-ui text-[11px] text-text-secondary leading-relaxed">
                        {inc.description}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-text-muted">
                        <span>📍 {inc.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] text-text-muted font-ui flex justify-between items-center">
          <span>Security Operations Center</span>
          <span className="text-rose-500 font-bold uppercase tracking-widest text-[9px] flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            Live monitor
          </span>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Report Incident">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block font-ui text-xs font-bold uppercase tracking-wider text-text-secondary">
              Severity Level
            </label>
            <select
              {...register("severity")}
              className="w-full rounded-lg border border-white/[0.08] bg-pitch-night px-3 py-2 font-ui text-sm text-text-primary outline-none focus:border-indigo-500/50"
            >
              <option value="low">Low (Standard Dispatch)</option>
              <option value="medium">Medium (Priority Response)</option>
              <option value="high">High (Immediate Action)</option>
            </select>
          </div>
          
          <Input
            label="Category"
            placeholder="e.g. Gate line queue overflow, medical alert"
            {...register("category")}
            error={errors.category?.message}
          />
          
          <div>
            <label className="mb-1 block font-ui text-xs font-bold uppercase tracking-wider text-text-secondary">
              Description
            </label>
            <textarea
              {...register("description")}
              placeholder="Provide exact operational details..."
              className="w-full rounded-lg border border-white/[0.08] bg-pitch-night px-3 py-2 font-ui text-sm text-text-primary outline-none focus:border-indigo-500/50 placeholder:text-text-muted"
              rows={3}
            />
            {errors.description && (
              <p className="mt-1 font-ui text-xs text-rose-400">{errors.description.message}</p>
            )}
          </div>
          
          <Input
            label="Location / Zone"
            placeholder="e.g. Concourse Section 102, Gate B entrance"
            {...register("location")}
            error={errors.location?.message}
          />
          
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={isPending}>
              Submit Incident Report
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
});
