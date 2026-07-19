import { Bot, ArrowRight } from "lucide-react";
import Markdown from "react-markdown";

const mdComponents = {
  p: ({ children }: any) => <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }: any) => <strong className="font-semibold text-text-primary">{children}</strong>,
  ul: ({ children }: any) => <ul className="list-disc pl-4 space-y-1 mb-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-4 space-y-1 mb-1">{children}</ol>,
  li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
};

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
  redirect: "text-blue-400 bg-blue-400/10 border-blue-400/25",
  deploy_barrier: "text-alert-amber bg-alert-amber/10 border-alert-amber/25",
  open_exit: "text-pitch-green-400 bg-pitch-green-400/10 border-pitch-green-400/25",
  hold: "text-text-muted bg-pitch-raised border-white/[0.05]",
};

export function ResponderLog({ decisions }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
        <div className="text-data font-semibold text-text-muted uppercase tracking-wider">AI Responder Log</div>
        {decisions.length > 0 && (
          <span className="text-[10px] bg-floodlight-200/10 text-floodlight-200 border border-floodlight-200/20 px-2 py-0.5 rounded-full font-mono font-bold">
            {decisions.length} EVENTS
          </span>
        )}
      </div>

      <div className="max-h-[480px] space-y-2.5 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-white/[0.08] scrollbar-track-transparent">
        {decisions.length === 0 && (
          <div className="text-data text-text-muted italic border border-dashed border-white/[0.06] rounded-data p-5 text-center bg-white/[0.01]">
            No decisions yet — responders activate after 3s
          </div>
        )}
        {[...decisions].reverse().map((d, i) => (
          <div 
            key={i} 
            className="rounded-data border border-white/[0.06] bg-pitch-raised/30 hover:bg-pitch-raised/60 hover:border-white/[0.12] p-3.5 transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5 mb-2">
              <div className="flex items-center gap-1.5 text-data">
                <Bot size={13} className="text-floodlight-200" />
                <span className="text-text-primary font-bold">R{d.responder_id + 1}</span>
                <ArrowRight size={10} className="text-text-muted" />
                <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ACTION_COLORS[d.action] || "text-text-muted"}`}>
                  {d.action.replace("_", " ")}
                </span>
              </div>
              <span className="text-[10px] font-mono text-text-muted">t={d.tick}s</span>
            </div>
            <div className="text-data-md text-text-secondary leading-relaxed font-ui">
              <Markdown components={mdComponents}>{d.reasoning}</Markdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

