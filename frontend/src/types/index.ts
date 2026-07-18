export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  severity: "low" | "medium" | "high";
  category: string;
  description: string;
  location: string;
  status: "open" | "resolved";
  createdAt: string;
}

export interface CrowdZone {
  id: string;
  name: string;
  density: number;
  capacity: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}

