import { apiClient } from "./apiClient";
import type { Recommendation } from "@/types";

export const fetchRecommendations = () => apiClient<Recommendation[]>("/ops/recommendations");
