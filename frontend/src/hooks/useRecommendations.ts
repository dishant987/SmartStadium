import { useQuery } from "@tanstack/react-query";
import { fetchRecommendations } from "@/services/recommendations";

export function useRecommendations() {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: fetchRecommendations,
    refetchInterval: 15_000,
  });
}
