import { useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, X } from "lucide-react";

export function ChatBubble() {
  const navigate = useNavigate();
  const location = useLocation();
  const isChat = location.pathname === "/chat";

  return (
    <button
      onClick={() => navigate(isChat ? "/" : "/chat")}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-floodlight-200 text-pitch-night shadow-lg transition-all hover:bg-floodlight-100 active:scale-95"
      aria-label={isChat ? "Back to dashboard" : "Open chat"}
    >
      {isChat ? <X size={24} /> : <MessageCircle size={24} />}
    </button>
  );
}
