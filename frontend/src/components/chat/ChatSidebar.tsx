import { useState } from "react";
import { Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ChatSession } from "@/types";

interface Props {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function ChatSidebar({ sessions, activeSessionId, isLoading, onSelect, onNew, onDelete }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChatSession | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="flex h-full w-[52px] flex-col items-center border-r border-border bg-pitch-night py-3">
        <button
          onClick={() => setCollapsed(false)}
          className="mb-4 flex h-9 w-9 items-center justify-center rounded-data text-text-muted transition-colors hover:bg-pitch-raised hover:text-text-primary"
          title="Open sidebar"
          aria-label="Open sidebar"
        >
          <PanelLeft size={18} />
        </button>
        <button
          onClick={onNew}
          className="mb-3 flex h-9 w-9 items-center justify-center rounded-data border border-border text-text-muted transition-colors hover:bg-pitch-raised hover:text-floodlight-300"
          title="New chat"
          aria-label="New chat"
        >
          <Plus size={18} />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => navigate("/profile")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-floodlight-300 text-sm font-bold text-pitch-night"
          title={user?.name || "Profile"}
          aria-label={user?.name || "Profile"}
        >
          {user?.name?.[0]?.toUpperCase() || "U"}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full w-[260px] flex-col border-r border-border bg-pitch-night">
        <div className="flex items-center justify-between px-3 py-3">
          <button
            onClick={onNew}
            className="flex items-center gap-2 rounded-data px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-pitch-raised hover:text-text-primary"
          >
            <Plus size={16} />
            New chat
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="flex h-8 w-8 items-center justify-center rounded-data text-text-muted transition-colors hover:bg-pitch-raised hover:text-text-primary"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 px-2 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2 rounded-data px-3 py-2.5 bg-pitch-raised/20 border border-white/[0.02]">
                  <Skeleton className="h-4 w-4 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-text-muted">No conversations yet</p>
          ) : (
            <div className="space-y-0.5 px-2">
              {sessions.map((s) => {
                const active = s.id === activeSessionId;
                const hovered = s.id === hoveredId;
                return (
                  <div
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    className={`group relative flex cursor-pointer items-center gap-2 rounded-data px-3 py-2.5 text-sm transition-colors ${active ? "bg-pitch-raised text-text-primary" : "text-text-secondary hover:bg-pitch-raised/50 hover:text-text-primary"
                      }`}
                    onClick={() => onSelect(s.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(s.id); } }}
                    onMouseEnter={() => setHoveredId(s.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <MessageSquare size={14} className="shrink-0 text-text-muted" />
                    <span className="flex-1 truncate">{s.title}</span>
                    {(hovered || undefined) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(s); }}
                        className="shrink-0 rounded-data p-1 text-text-muted transition-colors hover:bg-alert-red/20 hover:text-alert-red"
                        title="Delete chat"
                        aria-label={`Delete chat ${s.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border p-3">
          <button
            onClick={() => navigate("/profile")}
            className="flex w-full items-center gap-2.5 rounded-data px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-pitch-raised hover:text-text-primary"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-floodlight-300 text-xs font-bold text-pitch-night">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="truncate">{user?.name || "User"}</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget.id); setDeleteTarget(null); }}
        title="Delete chat"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </>
  );
}
