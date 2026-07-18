import { apiClient } from "./apiClient";
import type { Incident } from "@/types";

export const fetchIncidents = () => apiClient<Incident[]>("/ops/incidents");

export const reportIncident = (data: Omit<Incident, "id" | "createdAt" | "status">) =>
  apiClient<Incident>("/ops/incidents", {
    method: "POST",
    body: JSON.stringify(data),
  });
