import { useQuery } from "@tanstack/react-query";
import { fetchStations, fetchTip } from "@/services/sustainability";

export function useStations() {
  return useQuery({ queryKey: ["stations"], queryFn: fetchStations });
}

export function useSustainabilityTip() {
  return useQuery({ queryKey: ["sustainability-tip"], queryFn: fetchTip });
}
