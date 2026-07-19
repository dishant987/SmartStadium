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
