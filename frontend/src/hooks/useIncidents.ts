import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchIncidents, reportIncident } from "@/services/incidents";

export function useIncidents() {
  return useQuery({
    queryKey: ["incidents"],
    queryFn: fetchIncidents,
    refetchInterval: 15_000,
  });
}

export function useReportIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reportIncident,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incidents"] }),
  });
}
