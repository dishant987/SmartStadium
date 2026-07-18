import { apiClient } from "./apiClient";

export interface VenueZone {
  id: string;
  name: string;
  type: string;
}

export interface RouteStep {
  instruction: string;
  distance_m: number;
}

export interface VenueMapResponse {
  zones: VenueZone[];
  gates: { id: string; name: string; zone_id: string }[];
  amenities: { id: string; name: string; type: string; zone_id: string }[];
}

export interface RouteResponse {
  steps: RouteStep[];
  total_distance_m: number;
  accessible: boolean;
}

export const fetchVenueMap = () => apiClient<VenueMapResponse>("/nav/venue-map");

export const fetchRoute = (fromZone: string, toZone: string, accessible = false) =>
  apiClient<RouteResponse>("/nav/route", {
    method: "POST",
    body: JSON.stringify({ from_zone: fromZone, to_zone: toZone, accessible }),
  });
