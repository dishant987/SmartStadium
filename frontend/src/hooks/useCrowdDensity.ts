import { useQuery } from "@tanstack/react-query";
import { fetchCrowdDensity } from "@/services/crowdDensity";

export function useCrowdDensity() {
  return useQuery({
    queryKey: ["crowd-density"],
    queryFn: fetchCrowdDensity,
    refetchInterval: 10_000,
  });
}
