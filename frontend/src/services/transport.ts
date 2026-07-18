import { apiClient } from "./apiClient";

export interface TransitLine {
  id: string;
  name: string;
  mode: string;
  status: string;
  next_departure: string | null;
  delay_minutes: number;
}

export interface TransportStatusResponse {
  lines: TransitLine[];
  last_updated: string;
}

export const fetchTransportStatus = () =>
  apiClient<TransportStatusResponse>("/transport/status");
