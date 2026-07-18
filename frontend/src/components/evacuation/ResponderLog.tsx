import { Bot, ArrowRight } from "lucide-react";

interface Decision {
  responder_id: number;
  action: string;
  reasoning: string;
  target: number[];
  tick: number;
}

interface Props {
  decisions: Decision[];
}

const ACTION_COLORS: Record<string, string> = {
  redirect: "text-blue-400 bg-blue-400/10",
  deploy_barrier: "text-alert-orange bg-alert-orange/10",
  open_exit: "text-pitch-green-400 bg-pitch-green-400/10",
  hold: "text-text-muted bg-pitch-raised",
};

export function ResponderLog({ decisions }: Props) {
  return (
    <div className="space-y-2">
      <div className="text-data text-text-muted uppercase tracking-wider">AI Responder Log</div>
      <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
        {decisions.length === 0 && (
          <div className="text-data text-text-muted italic">No decisions yet — responders activate after 3s</div>
        )}
        {[...decisions].reverse().map((d, i) => (
          <div key={i} className="rounded-data bg-pitch-raised px-2.5 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-data">
                <Bot size={12} className="text-floodlight-200" />
                <span className="text-text-primary font-medium">R{d.responder_id + 1}</span>
                <ArrowRight size={10} className="text-text-muted" />
                <span className={`rounded-data px-1.5 py-0.5 text-data font-medium ${ACTION_COLORS[d.action] || "text-text-muted"}`}>
                  {d.action}
                </span>
              </div>
              <span className="text-data text-text-muted">t={d.tick}</span>
            </div>
            <p className="mt-1 text-data text-text-secondary leading-relaxed">{d.reasoning}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
