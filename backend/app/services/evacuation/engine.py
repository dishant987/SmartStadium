import asyncio
import random
from dataclasses import dataclass, field
import numpy as np

from app.services.evacuation.pathfinding import (
    Cell,
    compute_flow_field,
    create_stadium_layout,
)
from app.services.evacuation.agent import CrowdAgent
from app.services.evacuation.responder import ResponderAgent
from app.services.llm_provider import LLMProvider
from app.utils.logger import logger


@dataclass
class SimulationEngine:
    width: int = 80
    height: int = 60
    num_agents: int = 300
    num_responders: int = 3

    grid: np.ndarray = field(default=None, init=False)
    exits: list = field(default=None, init=False)
    flow: np.ndarray = field(default=None, init=False)
    agents: list = field(default=None, init=False)
    responders: list = field(default=None, init=False)
    tick: int = 0
    running: bool = False
    evacuated_count: int = 0
    fire_spread_chance: float = 0.03
    llm: LLMProvider = field(default_factory=LLMProvider)

    def __post_init__(self):
        self._init_sim()

    def _init_sim(self):
        self.grid, self.exits = create_stadium_layout(self.width, self.height)
        self.flow = compute_flow_field(self.grid, self.exits)
        self.agents = self._spawn_agents()
        self.responders = self._spawn_responders()
        self.tick = 0
        self.evacuated_count = 0

    def _spawn_agents(self) -> list[CrowdAgent]:
        agents = []
        empty = list(zip(*np.where(self.grid == Cell.EMPTY)))
        if not empty:
            return agents
        for _ in range(self.num_agents):
            r, c = random.choice(empty)
            agents.append(CrowdAgent(float(c), float(r)))
        return agents

    def _spawn_responders(self) -> list[ResponderAgent]:
        hw, hh = self.width // 2, self.height // 2
        sectors = [
            (0, hh, 0, hw),
            (0, hh, hw, self.width),
            (hh, self.height, 0, hw),
        ]
        return [
            ResponderAgent(id=i, sector=s, llm=self.llm) for i, s in enumerate(sectors)
        ]

    def inject_fire(self, row: int, col: int):
        if 0 <= row < self.height and 0 <= col < self.width:
            if self.grid[row, col] not in (Cell.WALL, Cell.EXIT):
                self.grid[row, col] = Cell.FIRE
                self.flow = compute_flow_field(self.grid, self.exits)
                logger.info("Fire injected at ({row}, {col})", row=row, col=col)

    def inject_obstacle(self, row: int, col: int):
        if 0 <= row < self.height and 0 <= col < self.width:
            if self.grid[row, col] not in (Cell.WALL, Cell.EXIT, Cell.FIRE):
                self.grid[row, col] = Cell.OBSTACLE
                self.flow = compute_flow_field(self.grid, self.exits)

    def _spread_fire(self):
        fires = list(zip(*np.where(self.grid == Cell.FIRE)))
        for fr, fc in fires:
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nr, nc = fr + dr, fc + dc
                if 0 <= nr < self.height and 0 <= nc < self.width:
                    if (
                        self.grid[nr, nc] == Cell.EMPTY
                        and random.random() < self.fire_spread_chance
                    ):
                        self.grid[nr, nc] = Cell.FIRE

    def _apply_responder_decision(self, decision: dict):
        action = decision.get("action", "hold")
        target = decision.get("target", [0, 0])
        if not isinstance(target, list) or len(target) < 2:
            return
        tr, tc = int(target[0]), int(target[1])

        if action == "redirect":
            # clear fire around target
            for dr in range(-2, 3):
                for dc in range(-2, 3):
                    nr, nc = tr + dr, tc + dc
                    if 0 <= nr < self.height and 0 <= nc < self.width:
                        if self.grid[nr, nc] == Cell.FIRE:
                            self.grid[nr, nc] = Cell.EMPTY
            self.flow = compute_flow_field(self.grid, self.exits)

        elif action == "deploy_barrier":
            if 0 <= tr < self.height and 0 <= tc < self.width:
                if self.grid[tr, tc] not in (Cell.WALL, Cell.EXIT, Cell.FIRE):
                    self.grid[tr, tc] = Cell.OBSTACLE
                    self.flow = compute_flow_field(self.grid, self.exits)

        elif action == "open_exit":
            if 0 <= tr < self.height and 0 <= tc < self.width:
                if self.grid[tr, tc] in (Cell.WALL, Cell.OBSTACLE):
                    self.grid[tr, tc] = Cell.EXIT
                    self.exits.append((tr, tc))
                    self.flow = compute_flow_field(self.grid, self.exits)

    async def run(self, broadcast_fn):
        self.running = True
        logger.info("Simulation started with {n} agents", n=self.num_agents)

        while self.running:
            self._spread_fire()

            for agent in self.agents:
                agent.step(self.flow, self.grid, self.agents)

            self.evacuated_count = sum(1 for a in self.agents if a.evacuated)

            # responder decisions
            decisions = []
            if self.tick % 60 == 0 and self.tick > 0:
                tasks = [
                    r.decide(self._sector_snap(r), self.tick) for r in self.responders
                ]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                for r in results:
                    if isinstance(r, dict) and r.get("action") != "hold":
                        self._apply_responder_decision(r)
                        decisions.append(r)

            state = self.get_state(decisions)
            await broadcast_fn(state)

            self.tick += 1
            all_evac = all(a.evacuated for a in self.agents)
            if all_evac:
                self.running = False
                await broadcast_fn(
                    {**state, "complete": True, "message": "All agents evacuated!"}
                )
                break

            await asyncio.sleep(0.05)

    def _sector_snap(self, responder: ResponderAgent) -> dict:
        rs, re, cs, ce = responder.sector
        grid_view = self.grid[rs:re, cs:ce]
        fires = list(zip(*np.where(grid_view == Cell.FIRE)))
        exits_in_sector = [
            (r + rs, c + cs) for r, c in zip(*np.where(grid_view == Cell.EXIT))
        ]
        agent_count = sum(
            1
            for a in self.agents
            if not a.evacuated and rs <= a.y < re and cs <= a.x < ce
        )
        return {
            "agent_count": agent_count,
            "fires": [(r + rs, c + cs) for r, c in fires],
            "exits": exits_in_sector,
            "flow_hint": "toward nearest exit",
        }

    def get_state(self, decisions: list | None = None) -> dict:
        active = [a.to_dict() for a in self.agents if not a.evacuated]
        # limit to 500 for websocket payload
        if len(active) > 500:
            active = active[:500]

        fires = list(zip(*np.where(self.grid == Cell.FIRE)))
        obstacles = list(zip(*np.where(self.grid == Cell.OBSTACLE)))

        return {
            "type": "state",
            "tick": self.tick,
            "width": self.width,
            "height": self.height,
            "agents": active,
            "agent_count": len([a for a in self.agents if not a.evacuated]),
            "total_agents": self.num_agents,
            "evacuated": self.evacuated_count,
            "fires": [(int(r), int(c)) for r, c in fires],
            "obstacles": [(int(r), int(c)) for r, c in obstacles],
            "responders": [
                {"id": r.id, "sector": list(r.sector)} for r in self.responders
            ],
            "decisions": decisions or [],
            "running": self.running,
        }

    def reset(self):
        self._init_sim()
