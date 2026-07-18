import { useQuery } from "@tanstack/react-query";
import { fetchVenueMap, fetchRoute } from "@/services/navigation";

export function useVenueMap() {
  return useQuery({ queryKey: ["venue-map"], queryFn: fetchVenueMap });
}

export function useRoute(from: string | null, to: string | null, accessible = false) {
  return useQuery({
    queryKey: ["nav-route", from, to, accessible],
    queryFn: () => fetchRoute(from!, to!, accessible),
    enabled: !!from && !!to,
  });
}
