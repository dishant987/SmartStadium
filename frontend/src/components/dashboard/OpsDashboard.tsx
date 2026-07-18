import { Card } from "@/components/ui/Card";
import { useIncidents } from "@/hooks/useIncidents";
import { useCrowdDensity } from "@/hooks/useCrowdDensity";

export function OpsDashboard() {
  const { data: incidents } = useIncidents();
  const { data: crowd } = useCrowdDensity();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <h3 className="mb-2 font-semibold">Incidents ({incidents?.length ?? 0})</h3>
      </Card>
      <Card>
        <h3 className="mb-2 font-semibold">Crowd Density ({crowd?.length ?? 0} zones)</h3>
      </Card>
    </div>
  );
}
