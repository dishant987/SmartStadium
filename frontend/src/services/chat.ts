import { apiClient } from "./apiClient";
import type { ChatSession, ChatMessage } from "@/types";

export const fetchSessions = () => apiClient<ChatSession[]>("/chat/sessions");

export const fetchSessionMessages = (id: string) =>
  apiClient<ChatMessage[]>(`/chat/sessions/${id}/messages`);

export const createSession = () =>
  apiClient<ChatSession>("/chat/sessions", { method: "POST" });

export const deleteSession = (id: string) =>
  apiClient<void>(`/chat/sessions/${id}`, { method: "DELETE" });

export const sendMessage = (sessionId: string, message: string) =>
  apiClient<ChatMessage>("/chat", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, message }),
  });

export function streamChat(
  sessionId: string,
  message: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
  signal?: AbortSignal,
) {
  const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
  fetch(`${BASE}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
    signal,
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.detail || "Stream failed");
    }
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n");
      buffer = parts.pop() || "";
      for (const line of parts) {
        if (line.startsWith("data: ")) {
          const payload = line.slice(6);
          if (payload === "[DONE]") { onDone(); return; }
          try {
            const parsed = JSON.parse(payload);
            if (parsed.token) onToken(parsed.token);
          } catch { onToken(payload); }
        }
      }
    }
    if (buffer) onToken(buffer);
    onDone();
  }).catch((err) => {
    if (err.name === "AbortError") return;
    onError(err);
  });
}
