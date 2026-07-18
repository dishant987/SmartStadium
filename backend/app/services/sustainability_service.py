"""GenAI-powered sustainability service.

Provides AI-generated personalized eco-tips, carbon impact analysis,
and real-time sustainability recommendations using LangChain + LangGraph."""
import random
from datetime import datetime, timezone

from app.schemas.sustainability_schema import (
    SustainabilityTipResponse, RecyclingStation, StationResponse,
    CarbonImpactResponse, PersonalizedTipResponse,
)
from app.services.llm_provider import LLMProvider
from app.utils.logger import logger

STATIC_TIPS = [
    "Bring a reusable water bottle — free refill stations are available at all venues.",
    "Walk or take public transit to reduce your carbon footprint. Shuttles run every 10 min.",
    "Sort your waste! Look for blue (recycling), green (compost), and black (landfill) bins.",
    "Carpool with fellow fans — parking lots offer priority spots for vehicles with 3+ occupants.",
    "Download the digital match program instead of printing.",
    "MetLife Stadium's LED lighting saves 60% energy vs traditional floodlights.",
    "The Meadowlands Rail reduces matchday carbon emissions by 60% compared to driving.",
]

CO2_PER_MODE = {"driving": 0.21, "transit": 0.08, "shuttle": 0.05, "walking": 0.0, "biking": 0.0}
EQUIVALENTS = {
    0.5: "Charging a smartphone for 60 days",
    1.0: "Watching 2 hours of Netflix on a 50-inch TV",
    2.5: "Running a washing machine for 10 loads",
    5.0: "A transatlantic flight per passenger per hour",
    10.0: "Heating a home for a day",
}


class SustainabilityService:
    def __init__(self):
        self.llm = LLMProvider()

    async def get_tip(self, context: str = "") -> SustainabilityTipResponse:
        if context and (self.llm._providers and any(p.__class__.__name__ != "MockChatModel" for p in self.llm._providers)):
            try:
                prompt = (
                    f"Generate one concise, specific sustainability tip for a fan attending a FIFA World Cup 2026 match "
                    f"at MetLife Stadium. Context: {context or 'general fan'}. "
                    f"Keep it under 100 characters. Return only the tip, no labels."
                )
                tip = await self.llm.complete(prompt)
                tip = tip.strip().strip('"\'')
                if tip:
                    return SustainabilityTipResponse(tip=tip, source="ai")
            except Exception as e:
                logger.warning("AI tip failed: {err}", err=str(e))
        return SustainabilityTipResponse(tip=random.choice(STATIC_TIPS), source="static")

    async def get_personalized_tips(self, zone: str = "", match_status: str = "") -> list[PersonalizedTipResponse]:
        prompt = (
            f"Generate 3 personalized sustainability tips for a fan at MetLife Stadium during FIFA World Cup 2026. "
            f"Zone: {zone or 'general'}. Match status: {match_status or 'in progress'}. "
            f"Each tip should have: tip text, context (why it matters), impact (CO2 saved), and category (transport/waste/energy/water). "
            f"Return as JSON array with keys: tip, context, impact, category."
        )
        try:
            response = await self.llm.complete(prompt)
            import json
            start = response.find("[")
            end = response.rfind("]") + 1
            if start != -1 and end != 0:
                tips_data = json.loads(response[start:end])
            else:
                tips_data = json.loads(response)
            if isinstance(tips_data, list):
                now = datetime.now(timezone.utc)
                res_tips = []
                for t in tips_data:
                    if not isinstance(t, dict):
                        continue
                    tip_val = t.get("tip") or t.get("tip_text") or t.get("text") or ""
                    context_val = t.get("context") or t.get("why_it_matters") or t.get("reason") or ""
                    impact_val = t.get("impact") or t.get("co2_saved") or t.get("carbon_saved") or ""
                    category_val = t.get("category") or t.get("type") or "waste"
                    if tip_val:
                        res_tips.append(
                            PersonalizedTipResponse(
                                tip=str(tip_val),
                                context=str(context_val),
                                impact=str(impact_val),
                                category=str(category_val),
                                generated_at=now
                            )
                        )
                if res_tips:
                    return res_tips[:3]
        except Exception as e:
            logger.warning("Personalized tips failed: {err}", err=str(e))
        now = datetime.now(timezone.utc)
        return [
            PersonalizedTipResponse(tip="Use the water refill stations near Gate A", context="Single-use plastic bottles are a major waste source at stadiums", impact="Saves ~0.5kg CO2 per match", category="waste", generated_at=now),
            PersonalizedTipResponse(tip="Take the Meadowlands Rail from Secaucus", context="Public transit cuts your matchday footprint by 60%", impact="Saves ~4kg CO2 per round trip", category="transport", generated_at=now),
            PersonalizedTipResponse(tip="Sort waste at the Fan Zone recycling stations", context="Stadium diversion rate is 85% when fans sort correctly", impact="Saves ~1kg CO2 per match", category="waste", generated_at=now),
        ]

    async def calculate_carbon(self, transport_mode: str, distance_km: float, group_size: int = 1) -> CarbonImpactResponse:
        co2_per_km = CO2_PER_MODE.get(transport_mode, 0.21)
        co2_kg = round(co2_per_km * distance_km * group_size, 2)
        equivalent = next((v for k, v in sorted(EQUIVALENTS.items()) if co2_kg <= k), EQUIVALENTS.get(10.0, ""))
        greener = {"driving": "transit", "transit": "shuttle", "shuttle": "walking"}.get(transport_mode, None)
        greener_option = None
        if greener and greener in CO2_PER_MODE:
            greener_co2 = round(CO2_PER_MODE[greener] * distance_km * group_size, 2)
            saving = round(co2_kg - greener_co2, 2)
            greener_option = f"Switch to {greener} to save {saving}kg CO2 ({(saving/co2_kg*100):.0f}% reduction)"

        tip_prompt = f"Give a one-sentence sustainability tip for a fan traveling {distance_km}km by {transport_mode} to a FIFA match."
        try:
            tip = await self.llm.complete(tip_prompt)
            tip = tip.strip().strip('"\'')
        except Exception:
            tip = f"Taking {transport_mode} to the match? {equivalent} — consider carpooling or transit to cut emissions."

        return CarbonImpactResponse(
            transport_mode=transport_mode, distance_km=distance_km,
            co2_kg=co2_kg, equivalent=equivalent,
            greener_option=greener_option, tip=tip,
        )

    async def get_stations(self) -> StationResponse:
        return StationResponse(
            stations=[
                RecyclingStation(id="rs1", location="Gate A Plaza", types=["plastic", "paper", "glass"]),
                RecyclingStation(id="rs2", location="East Stand Concourse", types=["plastic", "aluminum"]),
                RecyclingStation(id="rs3", location="Fan Zone Entrance", types=["plastic", "paper", "compost"]),
                RecyclingStation(id="rs4", location="Parking Lot A", types=["plastic", "glass"]),
                RecyclingStation(id="rs5", location="South Plaza Walkway", types=["compost", "plastic"]),
                RecyclingStation(id="rs6", location="Main Concourse Level 2", types=["plastic", "paper", "compost", "glass"]),
            ]
        )
