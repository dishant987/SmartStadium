"""Direct unit tests for nav_service _bfs function."""
import pytest
from app.services.nav_service import _bfs, resolve_zone_id


class TestBFS:
    def test_same_start_and_end(self):
        path = _bfs("z1", "z1")
        assert path == ["z1"]

    def test_valid_route(self):
        path = _bfs("z1", "z2")
        assert path is not None
        assert path[0] == "z1"
        assert path[-1] == "z2"

    def test_nonexistent_start_returns_none(self):
        path = _bfs("nonexistent", "z1")
        assert path is None

    def test_nonexistent_end_returns_none(self):
        path = _bfs("z1", "nonexistent")
        assert path is None

    def test_route_is_shortest(self):
        path = _bfs("z1", "z3")
        assert path is not None
        # BFS guarantees shortest path
        assert len(path) <= 4


class TestResolveZoneId:
    def test_resolves_known_name(self):
        result = resolve_zone_id("gate-a")
        assert result == "z1"

    def test_returns_id_if_already_valid(self):
        result = resolve_zone_id("z1")
        assert result == "z1"

    def test_returns_none_for_unknown(self):
        result = resolve_zone_id("mars colony")
        assert result is None
