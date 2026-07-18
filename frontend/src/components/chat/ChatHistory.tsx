import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";
import type { ChatSession } from "@/types";

interface Props {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export function ChatHistory({ sessions, activeSessionId, isLoading, onSelect, onNew, onDelete }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const { addToast } = useToast();
  void addToast;

  const handleDelete = (id: string) => {
    setDeleting(id);
    onDelete(id);
    setTimeout(() => setDeleting(null), 500);
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-pitch-surface">
      <div className="border-b border-border p-3">
        <Button size="sm" className="w-full" onClick={onNew}>
          <Plus size={14} /> New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : sessions.length === 0 ? (
          <p className="p-4 text-center font-ui text-data text-text-muted">No sessions yet</p>
        ) : (
          sessions.map((s) => {
            const active = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                className={`group relative flex cursor-pointer items-center gap-2 px-3 py-2.5 transition-colors ${
                  active ? "bg-pitch-raised" : "hover:bg-pitch-raised/50"
                }`}
                onClick={() => onSelect(s.id)}
              >
                <span className="flex-1 truncate font-ui text-body text-text-primary">{s.title}</span>
                <span className="shrink-0 font-ui text-data text-text-muted">{timeAgo(s.updatedAt)}</span>
                {deleting === s.id ? (
                  <span className="text-data text-text-muted">...</span>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                    className="rounded-data p-1 text-text-muted opacity-0 transition-all hover:bg-alert-red/20 hover:text-alert-red group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
