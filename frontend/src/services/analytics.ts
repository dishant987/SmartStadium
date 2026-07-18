import { apiClient } from "./apiClient";

export interface AnalyticsMetric {
  label: string;
  value: string;
  change: string;
  trend: string;
}

export interface AnalyticsPeakTime {
  minute: number;
  crowd_count: number;
  gate: string;
}

export interface AnalyticsGateStat {
  gate: string;
  peak_density: number;
  peak_minute: number;
  total_evacuated: number;
  avg_wait_min: number;
}

export interface AnalyticsNarrative {
  executive_summary: string;
  crowd_analysis: string;
  gate_performance: string;
  transit_impact: string;
  recommendations: string[];
}

export interface PostMatchAnalyticsResponse {
  match_name: string;
  date: string;
  metrics: AnalyticsMetric[];
  peak_times: AnalyticsPeakTime[];
  gate_stats: AnalyticsGateStat[];
  narrative: AnalyticsNarrative;
  crowd_timeline: Array<{ minute: number; count: number }>;
}

export const fetchPostMatchAnalytics = () =>
  apiClient<PostMatchAnalyticsResponse>("/analytics/post-match");
