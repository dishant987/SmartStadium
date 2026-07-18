import { apiClient } from "./apiClient";

export interface Station {
  id: string;
  location: string;
  type: "recycling" | "water" | "compost";
}

export const fetchStations = () => apiClient<Station[]>("/sustainability/stations");

export const fetchTip = () => apiClient<{ tip: string }>("/sustainability/tip");
