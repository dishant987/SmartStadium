from dataclasses import dataclass, field

from app.schemas.sustainability_schema import (
    SustainabilityTipResponse,
    RecyclingStation,
    StationResponse,
)
from app.services.llm_router_service import LLMRouterService


TIPS = [
    "Bring a reusable water bottle — free refill stations are available at all venues.",
    "Walk or take public transit to reduce your carbon footprint. Shuttles run every 10 min.",
    "Sort your waste! Look for blue (recycling), green (compost), and black (landfill) bins.",
    "Carpool with fellow fans — parking lots offer优先 spots for vehicles with 3+ occupants.",
    "Download the digital match program instead of printing.",
]


@dataclass
class SustainabilityService:
    llm: LLMRouterService = field(default_factory=LLMRouterService)

    async def get_tip(self) -> SustainabilityTipResponse:
        import random

        return SustainabilityTipResponse(tip=random.choice(TIPS))

    async def get_stations(self) -> StationResponse:
        return StationResponse(
            stations=[
                RecyclingStation(
                    id="rs1",
                    location="Gate A Plaza",
                    types=["plastic", "paper", "glass"],
                ),
                RecyclingStation(
                    id="rs2",
                    location="East Stand Concourse",
                    types=["plastic", "aluminum"],
                ),
                RecyclingStation(
                    id="rs3",
                    location="Fan Zone Entrance",
                    types=["plastic", "paper", "compost"],
                ),
                RecyclingStation(
                    id="rs4", location="Parking Lot A", types=["plastic", "glass"]
                ),
            ]
        )
