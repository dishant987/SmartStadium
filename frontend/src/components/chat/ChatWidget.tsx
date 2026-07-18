import { Button } from "@/components/ui/Button";

export function ChatWidget() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-700 bg-gray-800">
      <div className="border-b border-gray-700 p-3 font-semibold text-gray-200">Fan Companion</div>
      <div className="flex-1 p-3 text-sm text-gray-400">Ask anything about the tournament…</div>
      <div className="border-t p-3">
        <Button className="w-full">New Chat</Button>
      </div>
    </div>
  );
}
