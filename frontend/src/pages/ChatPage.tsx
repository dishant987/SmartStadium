import { useCallback, useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useChatSessions, useSessionMessages, useCreateSession, useDeleteSession } from "@/hooks/useChatSessions";
import { apiStream } from "@/services/apiClient";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/navigation/Navbar";
import type { ChatMessage, ChatSession } from "@/types";

const SUGGESTIONS = [
  { icon: "⚽", label: "Match Info", text: "What matches are scheduled today?" },
  { icon: "🚇", label: "Transit Status", text: "How do I get to MetLife Stadium by train?" },
  { icon: "♿", label: "Accessibility Guide", text: "Where is wheelchair-accessible seating?" },
  { icon: "🍔", label: "Concessions", text: "What food options are available near my seat?" },
];

export function ChatPage() {
  const navigate = useNavigate();
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const activeSessionId = urlSessionId || null;
  const { data: sessions } = useChatSessions();
  const { data: dbMessages } = useSessionMessages(activeSessionId);
  const { mutateAsync: createSession } = useCreateSession();
  const { mutate: deleteSession } = useDeleteSession();
  const qc = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUserMsg, setPendingUserMsg] = useState<ChatMessage | null>(null);
  const [sending, setSending] = useState(false);
  const [suggestionText, setSuggestionText] = useState("");

  useEffect(() => { setError(null); }, [urlSessionId]);

  useEffect(() => {
    if (pendingUserMsg && dbMessages?.some((m) => m.content === pendingUserMsg.content && m.role === "user")) {
      setPendingUserMsg(null);
    }
  }, [dbMessages, pendingUserMsg]);

  const displayMessages: ChatMessage[] = [
    ...(dbMessages || []),
    ...(pendingUserMsg && !dbMessages?.some((m) => m.content === pendingUserMsg.content && m.role === "user") ? [pendingUserMsg] : []),
  ];

  const handleSend = useCallback(async (message: string) => {
    if (!message.trim()) return;
    setError(null);
    setSending(true);

    let sessionId = activeSessionId;

    if (!sessionId) {
      try {
        const s = await createSession() as ChatSession;
        sessionId = s.id;
        navigate(`/chat/${sessionId}`, { replace: true });
      } catch {
        setError("Failed to create session");
        setSending(false);
        return;
      }
    }

    setPendingUserMsg({
      id: crypto.randomUUID(),
      sessionId: sessionId!,
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    });
    setStreamingText("");
    setIsStreaming(true);
    setSending(false);

    const ctrl = apiStream(
      "/chat/stream",
      { session_id: sessionId, message },
      (token) => setStreamingText((prev) => prev + token),
      () => {
        setIsStreaming(false);
        setStreamingText("");
        if (sessionId) qc.invalidateQueries({ queryKey: ["chat-messages", sessionId] });
      },
      (e) => { setError(e.message); setIsStreaming(false); setStreamingText(""); },
    );
    abortRef.current = ctrl;
  }, [activeSessionId, createSession, navigate, qc]);

  const handleStop = useCallback(() => { abortRef.current?.abort(); setIsStreaming(false); setStreamingText(""); }, []);
  const handleRegenerate = useCallback(() => {
    const lastUserMsg = [...displayMessages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) handleSend(lastUserMsg.content);
  }, [displayMessages, handleSend]);

  const hasMessages = displayMessages.length > 0;
  const showWelcome = !activeSessionId && !hasMessages;

  return (
    <div className="flex h-screen flex-col bg-pitch-night text-text-primary font-ui relative overflow-hidden">
      {/* Global Navbar */}
      <Navbar />

      {/* Main chat layout shifted down under the sticky navbar */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        <ChatSidebar
          sessions={sessions || []}
          activeSessionId={activeSessionId}
          isLoading={false}
          onSelect={(id) => navigate(`/chat/${id}`)}
          onNew={() => navigate("/chat")}
          onDelete={(id) => {
            deleteSession(id);
            if (activeSessionId === id) navigate("/chat");
          }}
        />

        <div className="flex flex-1 flex-col bg-pitch-night relative">
          {/* Animated Background Overlay */}
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-10" />

          {showWelcome ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 relative z-10">
              <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-pitch-green-500/[0.03] blur-[80px] pointer-events-none" />

              <h1 className="mb-2 text-3xl font-extrabold font-display tracking-tight text-text-primary">
                {getGreeting()}, {user?.name?.split(" ")[0] || "operator"}
              </h1>
              <p className="mb-10 text-body text-text-secondary">How can I assist you with MetLife Stadium operations today?</p>

              <div className="w-full max-w-2xl px-2">
                <ChatInput onSend={handleSend} onStop={handleStop} isStreaming={isStreaming} disabled={isStreaming || sending} centered defaultValue={suggestionText} />
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-2xl px-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSuggestionText(s.text)}
                    className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-pitch-surface/30 backdrop-blur-md px-4 py-2 text-data-md text-text-secondary transition-all hover:border-pitch-green-500/30 hover:bg-white/[0.04] hover:text-text-primary"
                  >
                    <span>{s.icon}</span>
                    <span className="font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ChatMessages
              messages={displayMessages}
              streamingText={streamingText}
              isStreaming={isStreaming}
              error={error}
              onRegenerate={handleRegenerate}
            />
          )}

          {hasMessages && (
            <div className="border-t border-white/[0.06] bg-pitch-night/50 backdrop-blur-md px-4 py-3 relative z-10">
              <div className="mx-auto max-w-3xl">
                <ChatInput onSend={handleSend} onStop={handleStop} isStreaming={isStreaming} disabled={isStreaming || sending} />
              </div>
            </div>
          )}

          {hasMessages && (
            <div className="pb-2 text-center relative z-10">
              <p className="text-[11px] text-text-muted">StadiumSense AI can make mistakes. Cross-check critical operations instructions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
