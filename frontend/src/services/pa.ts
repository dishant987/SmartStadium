import { apiClient } from "./apiClient";

export interface PAAnnouncementRequest {
  type: string;
  severity: string;
  message: string;
  gate: string;
  languages: string[];
  broadcast: boolean;
}

export interface PAAnnouncement {
  id: string;
  type: string;
  severity: string;
  original_message: string;
  translations: Record<string, string>;
  gate: string;
  timestamp: string;
  broadcast: boolean;
  status: string;
}

export interface PAAnnouncementResponse {
  announcement: PAAnnouncement;
  tts_urls: Record<string, string>;
}

export interface PALogEntry {
  id: string;
  type: string;
  severity: string;
  message: string;
  gate: string;
  timestamp: string;
  broadcast: boolean;
  languages: string[];
}

export interface PALogResponse {
  announcements: PALogEntry[];
  total: number;
}

export const createPAAnnouncement = (req: PAAnnouncementRequest) =>
  apiClient<PAAnnouncementResponse>("/pa/announce", {
    method: "POST",
    body: JSON.stringify(req),
  });

export const fetchPALog = () =>
  apiClient<PALogResponse>("/pa/log");
