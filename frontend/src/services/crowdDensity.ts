import { apiClient } from "./apiClient";
import type { CrowdZone } from "@/types";

export const fetchCrowdDensity = () => apiClient<CrowdZone[]>("/ops/crowd-density");
