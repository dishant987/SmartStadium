import numpy as np
from app.services.evacuation.pathfinding import Cell


class CrowdAgent:
    __slots__ = ("x", "y", "vx", "vy", "evacuated", "redirected")

    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y
        self.vx = 0.0
        self.vy = 0.0
        self.evacuated = False
        self.redirected = False

    def step(
        self,
        flow: np.ndarray,
        grid: np.ndarray,
        all_agents: list["CrowdAgent"],
        dt: float = 1.0,
    ):
        if self.evacuated:
            return

        r, c = int(round(self.y)), int(round(self.x))
        h, w = grid.shape

        if not (0 <= r < h and 0 <= c < w):
            self.evacuated = True
            return

        if grid[r, c] == Cell.EXIT:
            self.evacuated = True
            return

        if grid[r, c] in (Cell.WALL, Cell.FIRE, Cell.OBSTACLE):
            self._nudge(grid, h, w)
            return

        fx, fy = flow[r, c]
        speed = 0.4
        self.vx = fx * speed
        self.vy = fy * speed

        # simple separation — push away from nearby agents
        nx, ny = 0.0, 0.0
        for other in all_agents:
            if other is self or other.evacuated:
                continue
            dx = self.x - other.x
            dy = self.y - other.y
            d2 = dx * dx + dy * dy
            if d2 < 1.0 and d2 > 0.001:
                d = d2**0.5
                nx += dx / d * 0.15
                ny += dy / d * 0.15

        self.vx += nx
        self.vy += ny

        new_x = self.x + self.vx * dt
        new_y = self.y + self.vy * dt

        nr, nc = int(round(new_y)), int(round(new_x))
        if (
            0 <= nr < h
            and 0 <= nc < w
            and grid[nr, nc] not in (Cell.WALL, Cell.FIRE, Cell.OBSTACLE)
        ):
            self.x = new_x
            self.y = new_y
        else:
            self._nudge(grid, h, w)

    def _nudge(self, grid: np.ndarray, h: int, w: int):
        import random

        for _ in range(4):
            dx = random.uniform(-0.5, 0.5)
            dy = random.uniform(-0.5, 0.5)
            nx, ny = self.x + dx, self.y + dy
            r, c = int(round(ny)), int(round(nx))
            if (
                0 <= r < h
                and 0 <= c < w
                and grid[r, c] not in (Cell.WALL, Cell.FIRE, Cell.OBSTACLE)
            ):
                self.x, self.y = nx, ny
                return

    def to_dict(self):
        return {
            "x": round(self.x, 2),
            "y": round(self.y, 2),
            "evacuated": self.evacuated,
        }
