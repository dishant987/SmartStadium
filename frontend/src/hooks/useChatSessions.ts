import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import type { ChatSession, ChatMessage } from "@/types";

export function useChatSessions() {
  return useQuery({
    queryKey: ["chat-sessions"],
    queryFn: () => apiClient<ChatSession[]>("/chat/sessions"),
  });
}

export function useSessionMessages(sessionId: string | null) {
  return useQuery({
    queryKey: ["chat-messages", sessionId],
    queryFn: () => apiClient<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`),
    enabled: !!sessionId,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient<ChatSession>("/chat/sessions", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat-sessions"] }),
  });
}

interface DeleteCtx { prev: ChatSession[] | undefined; }

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient(`/chat/sessions/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["chat-sessions"] });
      const prev = qc.getQueryData<ChatSession[]>(["chat-sessions"]);
      qc.setQueryData(["chat-sessions"], (old?: ChatSession[]) => old?.filter((s) => s.id !== id) ?? []);
      return { prev };
    },
    onError: (_err: Error, _id: string, ctx: DeleteCtx | undefined) => {
      if (ctx?.prev) qc.setQueryData(["chat-sessions"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["chat-sessions"] }),
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) =>
      apiClient(`/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: ["chat-messages", variables.sessionId] }),
  });
}
