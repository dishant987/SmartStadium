"""Tests for the evacuation simulation engine."""
import numpy as np
import pytest
from app.services.evacuation.engine import SimulationEngine
from app.services.evacuation.pathfinding import Cell


@pytest.fixture
def engine():
    return SimulationEngine(width=40, height=30, num_agents=10)


def test_engine_init(engine):
    assert engine.grid is not None
    assert engine.exits is not None
    assert len(engine.agents) == 10
    assert engine.tick == 0
    assert engine.evacuated_count == 0


def test_inject_fire(engine):
    empty = list(zip(*np.where(engine.grid == Cell.EMPTY)))
    assert empty, "no empty cells in layout"
    r, c = empty[0]
    engine.inject_fire(r, c)
    assert engine.grid[r, c] == Cell.FIRE


def test_inject_obstacle(engine):
    empty = list(zip(*np.where(engine.grid == Cell.EMPTY)))
    assert empty, "no empty cells in layout"
    r, c = empty[1] if len(empty) > 1 else empty[0]
    engine.inject_obstacle(r, c)
    assert engine.grid[r, c] == Cell.OBSTACLE


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
    empty = list(zip(*np.where(engine.grid == Cell.EMPTY)))
    r, c = empty[0]
    engine.inject_fire(r, c)
    engine.tick = 50
    engine.reset()
    assert engine.tick == 0
    assert engine.evacuated_count == 0


def test_spread_fire(engine):
    empty = list(zip(*np.where(engine.grid == Cell.EMPTY)))
    r, c = empty[0]
    engine.inject_fire(r, c)
    pre = int(np.sum(engine.grid == Cell.FIRE))
    for _ in range(100):
        engine._spread_fire()
    post = int(np.sum(engine.grid == Cell.FIRE))
    assert post >= pre


def test_sector_snap(engine):
    snap = engine._sector_snap(engine.responders[0])
    assert "agent_count" in snap
    assert "fires" in snap
    assert "exits" in snap
