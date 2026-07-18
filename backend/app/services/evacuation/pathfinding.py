from enum import IntEnum
from collections import deque
import numpy as np


class Cell(IntEnum):
    EMPTY = 0
    WALL = 1
    EXIT = 2
    FIRE = 3
    OBSTACLE = 4


# ponytail: BFS flow field, good enough for 80x60 grid at 20fps
def compute_flow_field(grid: np.ndarray, exits: list[tuple[int, int]]) -> np.ndarray:
    h, w = grid.shape
    flow = np.zeros((h, w, 2), dtype=np.float32)
    dist = np.full((h, w), fill_value=9999, dtype=np.int32)

    q: deque[tuple[int, int]] = deque()
    for ex, ey in exits:
        if 0 <= ex < h and 0 <= ey < w:
            dist[ex, ey] = 0
            q.append((ex, ey))

    while q:
        r, c = q.popleft()
        d = dist[r, c]
        for dr, dc in [
            (-1, 0),
            (1, 0),
            (0, -1),
            (0, 1),
            (-1, -1),
            (-1, 1),
            (1, -1),
            (1, 1),
        ]:
            nr, nc = r + dr, c + dc
            if (
                0 <= nr < h
                and 0 <= nc < w
                and grid[nr, nc] not in (Cell.WALL, Cell.FIRE, Cell.OBSTACLE)
            ):
                cost = 1 if (dr == 0 or dc == 0) else 1.414
                nd = d + cost
                if nd < dist[nr, nc]:
                    dist[nr, nc] = int(nd)
                    q.append((nr, nc))

    for r in range(h):
        for c in range(w):
            if grid[r, c] in (Cell.WALL, Cell.FIRE, Cell.OBSTACLE, Cell.EXIT):
                continue
            best_d = dist[r, c]
            best = (0.0, 0.0)
            for dr, dc in [
                (-1, 0),
                (1, 0),
                (0, -1),
                (0, 1),
                (-1, -1),
                (-1, 1),
                (1, -1),
                (1, 1),
            ]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < h and 0 <= nc < w and dist[nr, nc] < best_d:
                    best_d = dist[nr, nc]
                    best = (float(dr), float(dc))
            mag = (best[0] ** 2 + best[1] ** 2) ** 0.5
            if mag > 0:
                flow[r, c] = (best[0] / mag, best[1] / mag)

    return flow


def create_stadium_layout(
    width: int = 80, height: int = 60
) -> tuple[np.ndarray, list[tuple[int, int]]]:
    grid = np.full((height, width), Cell.EMPTY, dtype=np.int8)

    # outer walls (stands)
    grid[0, :] = Cell.WALL
    grid[-1, :] = Cell.WALL
    grid[:, 0] = Cell.WALL
    grid[:, -1] = Cell.WALL

    # rows 1-4 and last 5 rows to last: stands
    grid[1:5, :] = Cell.WALL
    grid[-5:-1, :] = Cell.WALL
    grid[:, 1:5] = Cell.WALL
    grid[:, -5:-1] = Cell.WALL

    # inner field (can't walk on the pitch)
    grid[20:40, 25:55] = Cell.WALL

    # corridors: clear paths between stands and field
    grid[5:20, 5:75] = Cell.EMPTY
    grid[40:55, 5:75] = Cell.EMPTY
    grid[5:55, 5:25] = Cell.EMPTY
    grid[5:55, 55:75] = Cell.EMPTY

    # 4 exits — gaps in outer wall
    exits: list[tuple[int, int]] = []

    # top exit (center)
    grid[0, 35:45] = Cell.EXIT
    exits.extend([(0, i) for i in range(35, 45)])

    # bottom exit (center)
    grid[-1, 35:45] = Cell.EXIT
    exits.extend([(height - 1, i) for i in range(35, 45)])

    # left exit (center)
    grid[25:35, 0] = Cell.EXIT
    exits.extend([(i, 0) for i in range(25, 35)])

    # right exit (center)
    grid[25:35, -1] = Cell.EXIT
    exits.extend([(i, width - 1) for i in range(25, 35)])

    return grid, exits
