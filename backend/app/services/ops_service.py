import uuid
from datetime import datetime, timezone

from app.schemas.ops_schema import (
    IncidentReportRequest,
    IncidentReportResponse,
    CrowdZoneResponse,
    TransportLineResponse,
    RecommendationResponse,
)
from app.utils.logger import logger
from app.services.llm_provider import LLMProvider


class OpsService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.llm = LLMProvider()
            cls._instance._incidents: list = []
        return cls._instance

    async def list_incidents(self) -> list[dict]:
        return [i for i in self._incidents if i.get("status") != "resolved"]

    async def report_incident(
        self, req: IncidentReportRequest
    ) -> IncidentReportResponse:
        now = datetime.now(timezone.utc)
        record = {
            "id": str(uuid.uuid4()),
            "severity": req.severity,
            "type": req.category,
            "description": req.description,
            "location": req.location,
            "status": "open",
            "created_at": now,
        }
        self._incidents.append(record)
        return IncidentReportResponse(id=record["id"], status="open", created_at=now)

    async def get_crowd_density(self) -> list[CrowdZoneResponse]:
        return [
            CrowdZoneResponse(id="z1", name="Main Stand", density=0.72, capacity=5000),
            CrowdZoneResponse(id="z2", name="East Stand", density=0.45, capacity=3000),
            CrowdZoneResponse(id="z3", name="West Stand", density=0.88, capacity=3000),
            CrowdZoneResponse(id="z4", name="South Plaza", density=0.35, capacity=2000),
            CrowdZoneResponse(id="z5", name="Fan Zone", density=0.95, capacity=4000),
        ]

    async def get_transport_status(self) -> list[TransportLineResponse]:
        return [
            TransportLineResponse(id="t1", name="Green Line", status="normal", delay=0),
            TransportLineResponse(id="t2", name="Blue Line", status="delayed", delay=8),
            TransportLineResponse(id="t3", name="Shuttle A", status="normal", delay=0),
            TransportLineResponse(
                id="t4", name="Shuttle B", status="disrupted", delay=15
            ),
        ]

    async def get_recommendations(self) -> list[RecommendationResponse]:
        prompt = "List 3 real-time operational recommendations for a FIFA match day based on typical crowd patterns. Return as a short numbered list."
        try:
            tip = await self.llm.complete(prompt)
        except Exception as e:
            logger.warning("Ops recommendation LLM call failed: {}", e)
            tip = "Monitor Main Stand and Fan Zone congestion — consider staggering entry times."
        return [
            RecommendationResponse(
                id="r1", title="Crowd Management", description=tip, priority="high"
            ),
            RecommendationResponse(
                id="r2",
                title="Transport Alert",
                description="Blue Line delays of 8 min — advise fans to use Shuttle A as alternative.",
                priority="medium",
            ),
            RecommendationResponse(
                id="r3",
                title="Incident Watch",
                description="No active incidents. Continue standard monitoring.",
                priority="low",
            ),
        ]
