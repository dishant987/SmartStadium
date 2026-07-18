from dataclasses import dataclass

from app.schemas.wait_time_schema import (
    WaitTimeResponse,
    WaitTimeLocation,
    WaitTimeRequest,
)


WAIT_TIME_DATA = [
    WaitTimeLocation(
        id="food-main",
        name="Main Stand Concessions",
        type="food",
        zone="z1",
        current_wait_min=5,
        predicted_wait_halftime_min=15,
        predicted_wait_post_match_min=12,
        crowd_density=0.72,
        status="low",
        recommendation="Go now — lines are short. Halftime rush expected in 20 min.",
    ),
    WaitTimeLocation(
        id="food-east",
        name="East Stand Hot Dogs",
        type="food",
        zone="z2",
        current_wait_min=8,
        predicted_wait_halftime_min=18,
        predicted_wait_post_match_min=10,
        crowd_density=0.45,
        status="moderate",
        recommendation="Moderate wait. Consider West Stand — 3 min shorter.",
    ),
    WaitTimeLocation(
        id="food-west",
        name="West Stand Tacos",
        type="food",
        zone="z3",
        current_wait_min=4,
        predicted_wait_halftime_min=12,
        predicted_wait_post_match_min=8,
        crowd_density=0.88,
        status="low",
        recommendation="Quick now! Stand 4B beer garden next door has no line.",
    ),
    WaitTimeLocation(
        id="food-fan",
        name="Fan Zone Food Court",
        type="food",
        zone="z5",
        current_wait_min=10,
        predicted_wait_halftime_min=20,
        predicted_wait_post_match_min=15,
        crowd_density=0.95,
        status="busy",
        recommendation="Busy — highest density in stadium. Try South Plaza trucks instead.",
    ),
    WaitTimeLocation(
        id="bath-main",
        name="Main Stand Restrooms",
        type="restroom",
        zone="z1",
        current_wait_min=3,
        predicted_wait_halftime_min=10,
        predicted_wait_post_match_min=8,
        crowd_density=0.72,
        status="low",
        recommendation="No wait right now. Level 1 restrooms are less crowded.",
    ),
    WaitTimeLocation(
        id="bath-east",
        name="East Stand Restrooms",
        type="restroom",
        zone="z2",
        current_wait_min=6,
        predicted_wait_halftime_min=14,
        predicted_wait_post_match_min=10,
        crowd_density=0.45,
        status="moderate",
        recommendation="Short line. Accessible restroom has no wait.",
    ),
    WaitTimeLocation(
        id="bath-west",
        name="West Stand Restrooms",
        type="restroom",
        zone="z3",
        current_wait_min=2,
        predicted_wait_halftime_min=8,
        predicted_wait_post_match_min=6,
        crowd_density=0.88,
        status="low",
        recommendation="Almost empty — go now before halftime.",
    ),
    WaitTimeLocation(
        id="bath-fan",
        name="Fan Zone Restrooms",
        type="restroom",
        zone="z5",
        current_wait_min=7,
        predicted_wait_halftime_min=16,
        predicted_wait_post_match_min=12,
        crowd_density=0.95,
        status="moderate",
        recommendation="Busy. Family restroom near Nursing Room has no wait.",
    ),
    WaitTimeLocation(
        id="merch-main",
        name="Main Stand Merchandise",
        type="merchandise",
        zone="z1",
        current_wait_min=3,
        predicted_wait_halftime_min=8,
        predicted_wait_post_match_min=20,
        crowd_density=0.72,
        status="low",
        recommendation="Quick grab now. Post-match lines will be long.",
    ),
    WaitTimeLocation(
        id="merch-fan",
        name="Fan Zone Merchandise Tent",
        type="merchandise",
        zone="z5",
        current_wait_min=5,
        predicted_wait_halftime_min=12,
        predicted_wait_post_match_min=25,
        crowd_density=0.95,
        status="moderate",
        recommendation="Moderate. Main Stand has shorter lines.",
    ),
]


def _apply_match_context(
    locations: list[WaitTimeLocation], match_minute: int, match_status: str
) -> list[WaitTimeLocation]:
    adjusted = []
    for loc in locations:
        current = loc.current_wait_min
        halftime = loc.predicted_wait_halftime_min
        post = loc.predicted_wait_post_match_min

        if match_status == "halftime":
            factor = 1.0 + (0.3 if loc.type == "food" else 0.15)
            current = int(halftime * factor)
        elif match_status == "in_progress":
            progress = (
                min(match_minute / 45.0, 1.0)
                if match_minute <= 45
                else min((match_minute - 45) / 45.0, 1.0)
            )
            current = int(
                loc.current_wait_min
                + (halftime - loc.current_wait_min) * progress * 0.6
            )
        elif match_status == "post_match":
            current = post

        status = "low" if current <= 5 else "moderate" if current <= 12 else "busy"

        rec = loc.recommendation
        if status == "busy" and loc.type == "food":
            rec = f"Currently {current} min wait — busy. Try an alternative location."
        elif status == "low":
            rec = f"Only {current} min wait — go now before it gets busy."

        adjusted.append(
            loc.model_copy(
                update={
                    "current_wait_min": current,
                    "status": status,
                    "recommendation": rec,
                }
            )
        )
    return adjusted


@dataclass
class WaitTimeService:
    async def get_wait_times(self, req: WaitTimeRequest) -> WaitTimeResponse:
        locations = list(WAIT_TIME_DATA)
        if req.zone and req.zone != "all":
            locations = [loc for loc in locations if loc.zone == req.zone]

        adjusted = _apply_match_context(locations, req.match_minute, req.match_status)

        status_label = {
            "pre_match": "Pre-match",
            "in_progress": "In progress",
            "halftime": "Halftime",
            "post_match": "Post-match",
        }.get(req.match_status, "Pre-match")
        busy_count = sum(1 for loc in adjusted if loc.status == "busy")
        summary = f"{len(adjusted)} locations tracked. {busy_count} currently busy. Match minute: {req.match_minute}' ({status_label})."

        return WaitTimeResponse(
            locations=adjusted,
            match_minute=req.match_minute,
            match_status=req.match_status,
            summary=summary,
        )
