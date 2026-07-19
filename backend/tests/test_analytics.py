"""Tests for the analytics service."""
import pytest
from app.services.analytics_service import AnalyticsService


@pytest.mark.asyncio
async def test_analytics_response_shape():
    svc = AnalyticsService()
    result = await svc.get_post_match_analytics()
    assert result.match_name == "FIFA World Cup 2026 — Semifinal"
    assert len(result.metrics) == 6
    assert len(result.peak_times) == 4
    assert len(result.gate_stats) == 4
    assert result.narrative.executive_summary is not None
    assert result.narrative.crowd_analysis is not None
    assert result.narrative.gate_performance is not None
    assert len(result.narrative.recommendations) >= 1


@pytest.mark.asyncio
async def test_analytics_metrics_values():
    svc = AnalyticsService()
    result = await svc.get_post_match_analytics()
    metrics = {m.label: m for m in result.metrics}
    assert "Peak Attendance" in metrics
    assert metrics["Peak Attendance"].value == "72,000"
    assert metrics["Avg. Evacuation Time"].trend == "down"


@pytest.mark.asyncio
async def test_analytics_gate_stats():
    svc = AnalyticsService()
    result = await svc.get_post_match_analytics()
    gates = {g.gate: g for g in result.gate_stats}
    assert "Gate B" in gates
    assert gates["Gate B"].peak_density == 0.94
    assert gates["Gate B"].avg_wait_min == 8
