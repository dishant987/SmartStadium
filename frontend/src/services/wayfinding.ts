import { apiClient } from "./apiClient";

export interface WayfindingStep {
  step_number: number;
  instruction: string;
  landmark: string;
  distance_m: number;
  accessibility_note: string;
  level_change: string;
}

export interface WayfindingRoute {
  from_name: string;
  to_name: string;
  steps: WayfindingStep[];
  total_distance_m: number;
  estimated_time_min: number;
  accessible: boolean;
  accessibility_summary: string;
  wheelchair_alternative: string;
}

export interface WayfindingRequest {
  from_zone: string;
  to_zone: string;
  accessible: boolean;
  wheelchair: boolean;
  language: string;
}

export const fetchWayfinding = (req: WayfindingRequest) =>
  apiClient<WayfindingRoute>("/nav/wayfinding", {
    method: "POST",
    body: JSON.stringify(req),
  });
