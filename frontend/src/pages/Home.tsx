import { ChatWidget } from "@/components/chat/ChatWidget";
import { OpsDashboard } from "@/components/dashboard/OpsDashboard";

export function Home() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">FIFA Fan Companion</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OpsDashboard />
        </div>
        <div>
          <ChatWidget />
        </div>
      </div>
    </div>
  );
}
