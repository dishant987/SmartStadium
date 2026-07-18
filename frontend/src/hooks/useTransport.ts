import { useQuery } from "@tanstack/react-query";
import { fetchTransportStatus } from "@/services/transport";

export function useTransport() {
  return useQuery({
    queryKey: ["transport-status"],
    queryFn: fetchTransportStatus,
    refetchInterval: 15_000,
  });
}
