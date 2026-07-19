"""Tests for the evacuation simulation engine."""
import pytest
from app.services.evacuation.engine import SimulationEngine


@pytest.fixture
def engine():
    return SimulationEngine(width=40, height=30, num_agents=10, num_responders=1)


def test_engine_init(engine):
    assert engine.grid is not None
    assert engine.exits is not None
    assert len(engine.agents) == 10
    assert len(engine.responders) == 1
    assert engine.tick == 0
    assert engine.evacuated_count == 0


def test_inject_fire(engine):
    r, c = 10, 10
    engine.inject_fire(r, c)
    assert engine.grid[r, c] == 5  # Cell.FIRE


def test_inject_obstacle(engine):
    r, c = 10, 10
    engine.inject_obstacle(r, c)
    assert engine.grid[r, c] == 3  # Cell.OBSTACLE


def test_get_state_shape(engine):
    state = engine.get_state()
    assert state["type"] == "state"
    assert state["tick"] == 0
    assert state["total_agents"] == 10
    assert state["evacuated"] == 0
    assert isinstance(state["agents"], list)
    assert isinstance(state["fires"], list)
    assert isinstance(state["obstacles"], list)


def test_reset(engine):
    engine.inject_fire(10, 10)
    engine.tick = 50
    engine.reset()
    assert engine.tick == 0
    assert engine.evacuated_count == 0


def test_spread_fire(engine):
    engine.inject_fire(10, 10)
    pre = len(list(zip(*__import__("numpy").where(engine.grid == 5))))
    for _ in range(100):
        engine._spread_fire()
    post = len(list(zip(*__import__("numpy").where(engine.grid == 5))))
    assert post >= pre


def test_sector_snap(engine):
    snap = engine._sector_snap(engine.responders[0])
    assert "agent_count" in snap
    assert "fires" in snap
    assert "exits" in snap
