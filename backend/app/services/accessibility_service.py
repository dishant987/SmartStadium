"""AI-powered accessibility routing service.

Monitors real-time accessibility conditions (elevator status, ramp availability,
crowd density on accessible paths) and generates AI-optimized routes."""
import random
from datetime import datetime, timezone
from dataclasses import dataclass, field

from app.schemas.accessibility_schema import (
    AccessibilityStatus, AccessibilityRouteRequest, AccessibilityRouteStep,
    AccessibilityRouteResponse,
)
from app.schemas.nav_schema import RouteRequest
from app.services.nav_service import NavService, ZONE_GRAPH, ZONES, WAYFINDING_DETAILS
from app.services.llm_provider import LLMProvider
from app.utils.logger import logger

ELEVATORS = [
    {"id": "elev_a1", "name": "Elevator A1 (North Lobby)", "zone": "z1", "status": "operational"},
    {"id": "elev_e1", "name": "Elevator E1 (East Lobby)", "zone": "z2", "status": "operational"},
    {"id": "elev_w1", "name": "Elevator W1 (West Lobby)", "zone": "z3", "status": "operational"},
    {"id": "elev_s1", "name": "Elevator S1 (South Gate)", "zone": "z4", "status": "operational"},
]

RAMP_ACCESS = {
    "z1": {"ramp": "North Ramp A1", "status": "open"},
    "z2": {"ramp": "East Ramp E1", "status": "open"},
    "z3": {"ramp": "West Ramp W1", "status": "open"},
    "z4": {"ramp": "South Plaza Ramps", "status": "open"},
    "z5": {"ramp": "Fan Zone Walk-in", "status": "open"},
}

_conditions: dict = {
    "elevator_outages": [],
    "ramp_closures": [],
    "crowded_accessible_paths": [],
}


def _simulate_conditions():
    """Simulate changing accessibility conditions."""
    now_ts = datetime.now(timezone.utc).timestamp()
    seed = int(now_ts / 30)
    rng = random.Random(seed)

    _conditions["elevator_outages"] = []
    for e in ELEVATORS:
        if rng.random() < 0.15:
            _conditions["elevator_outages"].append(e["id"])
            e["status"] = "out_of_service"
        else:
            e["status"] = "operational"

    _conditions["ramp_closures"] = []
    for z_id, ramp in RAMP_ACCESS.items():
        if rng.random() < 0.08:
            _conditions["ramp_closures"].append(z_id)
            ramp["status"] = "closed"
        else:
            ramp["status"] = "open"

    _conditions["crowded_accessible_paths"] = [
        z_id for z_id in ZONE_GRAPH if rng.random() < 0.2
    ]


@dataclass
class AccessibilityService:
    llm: LLMProvider = field(default_factory=LLMProvider)
    nav: NavService = field(default_factory=NavService)

    async def get_status(self) -> list[AccessibilityStatus]:
        _simulate_conditions()
        return [
            AccessibilityStatus(elevator_id=e["id"], elevator_name=e["name"], status=e["status"],
                                note="Out of service — use alternative elevator or ramp" if e["status"] == "out_of_service" else "Operational")
            for e in ELEVATORS
        ]

    async def get_ai_route(self, req: AccessibilityRouteRequest) -> AccessibilityRouteResponse:
        _simulate_conditions()
        route_req = RouteRequest(from_zone=req.from_zone, to_zone=req.to_zone, accessible=True)
        base_route = await self.nav.get_route(route_req)

        from_info = WAYFINDING_DETAILS.get(req.from_zone, {})
        to_info = WAYFINDING_DETAILS.get(req.to_zone, {})
        from_name = from_info.get("full_name", req.from_zone)
        to_name = to_info.get("full_name", req.to_zone)

        warnings: list[str] = []
        steps: list[AccessibilityRouteStep] = []
        step_num = 1

        for s in base_route.steps:
            note = ""
            warning = ""
            if "elevator" in s.instruction.lower():
                matched = [e for e in ELEVATORS if e["name"].split("(")[0].strip() in s.instruction]
                if matched and matched[0]["status"] == "out_of_service":
                    note = f"{matched[0]['name']} is out of service"
                    alt = RAMP_ACCESS.get(req.from_zone, {}).get("ramp", "use alternative route")
                    warning = f"Use {alt} instead"
                    warnings.append(f"Elevator outage: {matched[0]['name']}")
            if req.avoid_crowds and req.from_zone in _conditions["crowded_accessible_paths"]:
                if not note:
                    note = "Path may be crowded — allow extra time"
                    warning = "High crowd density on this accessible route"
                    warnings.append("Crowded accessible path in your zone")
            steps.append(AccessibilityRouteStep(
                step_number=step_num, instruction=s.instruction,
                distance_m=s.distance_m, accessibility_note=note, warning=warning,
            ))
            step_num += 1

        if not warnings:
            steps.append(AccessibilityRouteStep(
                step_number=step_num, instruction="Arrived at destination — all accessible paths clear",
                distance_m=0, accessibility_note="Step-free route confirmed",
            ))

        ai_prompt = (
            f"Summarize this accessible route at MetLife Stadium for a{' wheelchair user' if req.wheelchair else ' fan with mobility needs'}. "
            f"Route: {from_name} to {to_name}. Distance: {base_route.total_distance_m}m. "
            f"Warnings: {'; '.join(warnings) if warnings else 'None — all clear'}. "
            f"Keep it to one sentence."
        )
        try:
            ai_summary = (await self.llm.complete(ai_prompt)).strip().strip('"\'')
        except Exception:
            ai_summary = f"Accessible route from {from_name} to {to_name}. Total distance {base_route.total_distance_m}m."

        if not warnings:
            warnings.append("All accessibility infrastructure operational")

        total_dist = base_route.total_distance_m
        return AccessibilityRouteResponse(
            from_name=from_name, to_name=to_name, steps=steps,
            total_distance_m=total_dist, estimated_time_min=max(1, total_dist // 80),
            ai_summary=ai_summary, warnings=warnings,
            generated_at=datetime.now(timezone.utc),
        )
