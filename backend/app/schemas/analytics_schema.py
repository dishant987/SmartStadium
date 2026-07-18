from pydantic import BaseModel


class AnalyticsMetric(BaseModel):
    label: str
    value: str
    change: str = ""
    trend: str = "neutral"


class AnalyticsPeakTime(BaseModel):
    minute: int
    crowd_count: int
    gate: str


class AnalyticsGateStat(BaseModel):
    gate: str
    peak_density: float
    peak_minute: int
    total_evacuated: int
    avg_wait_min: int


class AnalyticsNarrative(BaseModel):
    executive_summary: str
    crowd_analysis: str
    gate_performance: str
    transit_impact: str
    recommendations: list[str]


class PostMatchAnalyticsResponse(BaseModel):
    match_name: str
    date: str
    metrics: list[AnalyticsMetric]
    peak_times: list[AnalyticsPeakTime]
    gate_stats: list[AnalyticsGateStat]
    narrative: AnalyticsNarrative
    crowd_timeline: list[dict]
