import { apiClient } from "./apiClient";

export interface WaitTimeLocation {
  id: string;
  name: string;
  type: string;
  zone: string;
  current_wait_min: number;
  predicted_wait_halftime_min: number;
  predicted_wait_post_match_min: number;
  crowd_density: number;
  status: string;
  recommendation: string;
}

export interface WaitTimeResponse {
  locations: WaitTimeLocation[];
  match_minute: number;
  match_status: string;
  summary: string;
}

export interface WaitTimeRequest {
  zone: string;
  match_minute: number;
  match_status: string;
}

export const fetchWaitTimes = (req: WaitTimeRequest) =>
  apiClient<WaitTimeResponse>("/ops/wait-times", {
    method: "POST",
    body: JSON.stringify(req),
  });
