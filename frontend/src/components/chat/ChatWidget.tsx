import { Button } from "@/components/ui/Button";

export function ChatWidget() {
  return (
    <div className="flex h-full flex-col rounded-lg border bg-white">
      <div className="border-b p-3 font-semibold">Fan Companion</div>
      <div className="flex-1 p-3 text-sm text-gray-500">Ask anything about the tournament…</div>
      <div className="border-t p-3">
        <Button className="w-full">New Chat</Button>
      </div>
    </div>
  );
}
