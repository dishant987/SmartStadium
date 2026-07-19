"""Real-time stadium data simulation engine.

Generates dynamic crowd density, transit status, and wait-time data
that changes over time. Used by the WebSocket real-time endpoint."""
import math
import random
from datetime import datetime, timezone
from dataclasses import dataclass


ZONES = [
    {"id": "z1", "name": "Main Stand", "capacity": 5000},
    {"id": "z2", "name": "East Stand", "capacity": 3000},
    {"id": "z3", "name": "West Stand", "capacity": 3000},
    {"id": "z4", "name": "South Plaza", "capacity": 2000},
    {"id": "z5", "name": "Fan Zone", "capacity": 4000},
]

TRANSIT_LINES = [
    {"id": "t1", "name": "Green Line", "mode": "metro"},
    {"id": "t2", "name": "Blue Line", "mode": "metro"},
    {"id": "t3", "name": "Shuttle A — Stadium Loop", "mode": "shuttle"},
    {"id": "t4", "name": "Shuttle B — Downtown Express", "mode": "shuttle"},
    {"id": "t5", "name": "Bus 12 — North Route", "mode": "bus"},
    {"id": "t6", "name": "Bus 27 — South Route", "mode": "bus"},
]

WAIT_LOCATIONS = [
    {"id": "food-main", "name": "Main Stand Concessions", "type": "food", "zone": "z1", "base_wait": 5},
    {"id": "food-east", "name": "East Stand Hot Dogs", "type": "food", "zone": "z2", "base_wait": 8},
    {"id": "food-west", "name": "West Stand Tacos", "type": "food", "zone": "z3", "base_wait": 4},
    {"id": "food-fan", "name": "Fan Zone Food Court", "type": "food", "zone": "z5", "base_wait": 10},
    {"id": "bath-main", "name": "Main Stand Restrooms", "type": "restroom", "zone": "z1", "base_wait": 3},
    {"id": "bath-east", "name": "East Stand Restrooms", "type": "restroom", "zone": "z2", "base_wait": 6},
    {"id": "bath-west", "name": "West Stand Restrooms", "type": "restroom", "zone": "z3", "base_wait": 2},
    {"id": "bath-fan", "name": "Fan Zone Restrooms", "type": "restroom", "zone": "z5", "base_wait": 7},
    {"id": "merch-main", "name": "Main Stand Merchandise", "type": "merchandise", "zone": "z1", "base_wait": 3},
    {"id": "merch-fan", "name": "Fan Zone Merchandise Tent", "type": "merchandise", "zone": "z5", "base_wait": 5},
]


@dataclass
class RealtimeSimulator:
    _tick: int = 0
    _match_minute: int = 0
    _match_status: str = "pre_match"

    def _sim_crowd_density(self) -> list[dict]:
        t = self._tick * 0.02
        data = []
        for z in ZONES:
            wave = 0.5 + 0.4 * math.sin(t + hash(z["id"]) % 10)
            if self._match_status == "halftime":
                wave += 0.2 * math.sin(t * 2 + hash(z["id"]) % 5)
            elif self._match_status == "post_match":
                wave = max(0, wave - 0.3 * min(self._match_minute / 30, 1))
            density = min(1.0, max(0.05, wave * random.uniform(0.85, 1.15)))
            data.append({"id": z["id"], "name": z["name"], "density": round(density, 2), "capacity": z["capacity"]})
        return data

    def _sim_transit(self) -> list[dict]:
        data = []
        for line in TRANSIT_LINES:
            r = random.random()
            if r < 0.7:
                status, delay = "normal", 0
            elif r < 0.9:
                status, delay = "delayed", random.randint(5, 15)
            else:
                status, delay = "disrupted", random.randint(15, 30)
            next_dep = f"{random.randint(1, 15)} min" if status == "normal" else f"{delay + random.randint(1, 5)} min"
            data.append({
                "id": line["id"], "name": line["name"], "mode": line["mode"],
                "status": status, "delay_minutes": delay, "next_departure": next_dep,
            })
        return data

    def _sim_wait_times(self) -> list[dict]:
        data = []
        for loc in WAIT_LOCATIONS:
            factor = 1.0
            if self._match_status == "halftime" and loc["type"] == "food":
                factor = 2.5
            elif self._match_status == "in_progress":
                factor = 1.0 + 0.5 * math.sin(self._tick * 0.01 + hash(loc["id"]) % 10)
            elif self._match_status == "post_match":
                factor = 1.5 if loc["type"] in ("merchandise", "restroom") else 0.8
            wait = max(1, int(loc["base_wait"] * factor * random.uniform(0.8, 1.2)))
            status = "low" if wait <= 5 else "moderate" if wait <= 12 else "busy"
            data.append({
                "id": loc["id"], "name": loc["name"], "type": loc["type"],
                "zone": loc["zone"], "current_wait_min": wait, "status": status,
            })
        return data

    def get_state(self) -> dict:
        self._tick += 1
        self._match_minute = (self._tick // 6) % 120
        if self._match_minute < 45:
            self._match_status = "in_progress"
        elif self._match_minute < 50:
            self._match_status = "halftime"
        elif self._match_minute < 95:
            self._match_status = "in_progress"
        else:
            self._match_status = "post_match"
        return {
            "type": "state_update",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "tick": self._tick,
            "match_minute": self._match_minute,
            "match_status": self._match_status,
            "crowd_density": self._sim_crowd_density(),
            "transit": self._sim_transit(),
            "wait_times": self._sim_wait_times(),
        }


@dataclass
class OpsLangGraphAgent:
    """Multi-agent LangGraph for operational decision support.
    Analyzes real-time state and generates recommendations + volunteer task assignments."""

    async def analyze(self, state: dict) -> dict:
        crowd = state.get("crowd_density", [])
        transit = state.get("transit", [])
        packed = [z for z in crowd if z["density"] > 0.8]
        delayed = [t for t in transit if t["status"] != "normal"]

        recommendations = []
        volunteer_tasks = []

        if packed:
            zones_str = ", ".join(z["name"] for z in packed[:3])
            recommendations.append({
                "id": "rec_crowd", "title": "Crowd Management",
                "description": f"High density in {zones_str}. Consider staggering entry or opening additional exits.",
                "priority": "high",
            })
            for z in packed[:2]:
                volunteer_tasks.append({
                    "type": "crowd_assist",
                    "zone": z["id"],
                    "description": f"Assist with crowd flow at {z['name']} (density: {z['density']:.0%})",
                    "priority": "high",
                })

        if delayed:
            lines_str = ", ".join(f"{t['name']} ({t['status']}, {t['delay_minutes']}min)" for t in delayed[:3])
            recommendations.append({
                "id": "rec_transit", "title": "Transport Alert",
                "description": f"Issues on: {lines_str}. Advise fans of alternative routes.",
                "priority": "medium",
            })
            for t in delayed[:2]:
                volunteer_tasks.append({
                    "type": "transit_guide",
                    "zone": t["id"],
                    "description": f"Guide fans at {t['name']} — {t['delay_minutes']}min delay",
                    "priority": "medium",
                })

        if not recommendations:
            recommendations.append({
                "id": "rec_all_clear", "title": "All Clear",
                "description": "No active issues. Continue standard monitoring.",
                "priority": "low",
            })

        return {
            "recommendations": recommendations,
            "volunteer_tasks": volunteer_tasks,
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
        }
