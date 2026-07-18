from dataclasses import dataclass
from datetime import datetime

from app.schemas.transport_schema import TransitLine, TransportStatusResponse


@dataclass
class TransportService:
    async def get_status(self) -> TransportStatusResponse:
        return TransportStatusResponse(
            lines=[
                TransitLine(
                    id="m1",
                    name="Green Line",
                    mode="metro",
                    status="normal",
                    next_departure="2 min",
                    delay_minutes=0,
                ),
                TransitLine(
                    id="m2",
                    name="Blue Line",
                    mode="metro",
                    status="delayed",
                    next_departure="10 min",
                    delay_minutes=8,
                ),
                TransitLine(
                    id="s1",
                    name="Shuttle A — Stadium Loop",
                    mode="shuttle",
                    status="normal",
                    next_departure="1 min",
                    delay_minutes=0,
                ),
                TransitLine(
                    id="s2",
                    name="Shuttle B — Downtown Express",
                    mode="shuttle",
                    status="disrupted",
                    next_departure="20 min",
                    delay_minutes=15,
                ),
                TransitLine(
                    id="b1",
                    name="Bus 12 — North Route",
                    mode="bus",
                    status="normal",
                    next_departure="5 min",
                    delay_minutes=0,
                ),
                TransitLine(
                    id="b2",
                    name="Bus 27 — South Route",
                    mode="bus",
                    status="normal",
                    next_departure="7 min",
                    delay_minutes=0,
                ),
            ],
            last_updated=datetime.utcnow(),
        )
