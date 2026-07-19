from app.utils.logger import logger

from app.schemas.analytics_schema import (
    PostMatchAnalyticsResponse,
    AnalyticsMetric,
    AnalyticsPeakTime,
    AnalyticsGateStat,
    AnalyticsNarrative,
)
from app.services.llm_provider import LLMProvider


class AnalyticsService:
    def __init__(self) -> None:
        self.llm = LLMProvider()

    async def get_post_match_analytics(self) -> PostMatchAnalyticsResponse:
        metrics = [
            AnalyticsMetric(
                label="Peak Attendance",
                value="72,000",
                change="+2,000 from last match",
                trend="up",
            ),
            AnalyticsMetric(
                label="Avg. Evacuation Time",
                value="18 min",
                change="-3 min improvement",
                trend="down",
            ),
            AnalyticsMetric(
                label="Gate B Density Peak",
                value="94%",
                change="Critical threshold exceeded",
                trend="up",
            ),
            AnalyticsMetric(
                label="Transit Delays",
                value="12%",
                change="NJ Transit Blue Line",
                trend="up",
            ),
            AnalyticsMetric(
                label="PA Announcements",
                value="7",
                change="3 emergency, 4 advisory",
                trend="neutral",
            ),
            AnalyticsMetric(
                label="Incidents Reported",
                value="4",
                change="All resolved",
                trend="down",
            ),
        ]

        peak_times = [
            AnalyticsPeakTime(minute=34, crowd_count=72000, gate="All gates"),
            AnalyticsPeakTime(minute=45, crowd_count=68000, gate="Gate B"),
            AnalyticsPeakTime(minute=60, crowd_count=71500, gate="Gate A"),
            AnalyticsPeakTime(minute=90, crowd_count=65000, gate="Gate D"),
        ]

        gate_stats = [
            AnalyticsGateStat(
                gate="Gate A",
                peak_density=0.82,
                peak_minute=60,
                total_evacuated=18500,
                avg_wait_min=4,
            ),
            AnalyticsGateStat(
                gate="Gate B",
                peak_density=0.94,
                peak_minute=45,
                total_evacuated=21000,
                avg_wait_min=8,
            ),
            AnalyticsGateStat(
                gate="Gate C",
                peak_density=0.71,
                peak_minute=34,
                total_evacuated=16000,
                avg_wait_min=3,
            ),
            AnalyticsGateStat(
                gate="Gate D",
                peak_density=0.88,
                peak_minute=90,
                total_evacuated=16500,
                avg_wait_min=6,
            ),
        ]

        crowd_timeline = [
            {"minute": 0, "count": 45000},
            {"minute": 15, "count": 62000},
            {"minute": 30, "count": 70000},
            {"minute": 34, "count": 72000},
            {"minute": 45, "count": 68000},
            {"minute": 60, "count": 71500},
            {"minute": 75, "count": 69000},
            {"minute": 90, "count": 65000},
            {"minute": 95, "count": 42000},
            {"minute": 100, "count": 28000},
            {"minute": 110, "count": 12000},
            {"minute": 120, "count": 3000},
        ]

        prompt = (
            "Generate a post-match analytics narrative for a FIFA World Cup 2026 match at MetLife Stadium. "
            "Key data: Crowd peaked at 72,000 at minute 34. Gate B had highest density at 94% at minute 45. "
            "NJ Transit Blue Line delays caused 12% of fans to leave 10+ minutes late. "
            "Total evacuation time was 18 minutes (3 min improvement over average). "
            "4 incidents reported, all resolved. 7 PA announcements made. "
            "Gate B had longest wait times (8 min avg). Gate C was fastest (3 min avg). "
            "Write: executive summary, crowd analysis, gate performance, transit impact, and 3 actionable recommendations. "
            "Keep each section to 2-3 sentences. Be specific with numbers."
        )

        try:
            narrative_text = await self.llm.complete(prompt)
            paragraphs = [p.strip() for p in narrative_text.split("\n\n") if p.strip()]
            narrative = AnalyticsNarrative(
                executive_summary=paragraphs[0]
                if len(paragraphs) > 0
                else "Match completed successfully with 72,000 peak attendance.",
                crowd_analysis=paragraphs[1]
                if len(paragraphs) > 1
                else "Crowd peaked at minute 34 with strong flow through all gates.",
                gate_performance=paragraphs[2]
                if len(paragraphs) > 2
                else "Gate B experienced highest density. Gate C had best throughput.",
                transit_impact=paragraphs[3]
                if len(paragraphs) > 3
                else "NJ Transit delays impacted 12% of departing fans.",
                recommendations=[p.strip("- ") for p in paragraphs[4:7]]
                if len(paragraphs) > 4
                else [
                    "Increase Gate B staff by 20% for next match",
                    "Add backup shuttle service during Blue Line disruptions",
                    "Deploy crowd density sensors at Gate B choke points",
                ],
            )
        except Exception as e:
            logger.warning("Analytics narrative generation failed: {}", e)
            narrative = AnalyticsNarrative(
                executive_summary="The FIFA World Cup 2026 match at MetLife Stadium drew a peak crowd of 72,000 at minute 34, with strong attendance throughout the 90-minute match.",
                crowd_analysis="Crowd density peaked at 72,000 spectators during the first half. Gate B experienced the highest density at 94% capacity at minute 45, triggering overflow protocols. Post-match evacuation began promptly at full time.",
                gate_performance="Gate B had the highest density (94% peak) and longest average wait time (8 minutes). Gate C performed best with only 3-minute average wait. Gate A and Gate D handled steady flow with moderate delays.",
                transit_impact="NJ Transit Blue Line delays of 8-15 minutes caused approximately 12% of fans to delay their departure by 10+ minutes. Shuttle B service was disrupted, concentrating crowd pressure on remaining transit options.",
                recommendations=[
                    "Increase Gate B staff by 20% and add a secondary exit queue for high-density matches",
                    "Pre-position backup shuttle buses at Gate D when Blue Line disruptions are detected",
                    "Install real-time crowd density sensors at Gate B choke points with automated PA announcements",
                ],
            )

        return PostMatchAnalyticsResponse(
            match_name="FIFA World Cup 2026 — Semifinal",
            date="2026-07-14",
            metrics=metrics,
            peak_times=peak_times,
            gate_stats=gate_stats,
            narrative=narrative,
            crowd_timeline=crowd_timeline,
        )
