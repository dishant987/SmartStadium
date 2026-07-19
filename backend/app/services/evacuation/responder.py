import json
import asyncio
from dataclasses import dataclass
from app.services.llm_provider import LLMProvider
from app.utils.logger import logger


@dataclass
class ResponderAgent:
    id: int
    sector: tuple[int, int, int, int]  # row_start, row_end, col_start, col_end
    llm: LLMProvider
    last_tick: int = 0
    cooldown: int = 60  # 3 seconds at 20fps

    async def decide(self, grid_snapshot: dict, tick: int) -> dict | None:
        if tick - self.last_tick < self.cooldown:
            return None
        self.last_tick = tick

        prompt = self._build_prompt(grid_snapshot)
        try:
            raw = await asyncio.wait_for(self.llm.complete(prompt), timeout=10)
            decision = self._parse(raw)
            decision["responder_id"] = self.id
            decision["tick"] = tick
            logger.info(
                "Responder {id} decided: {action}",
                id=self.id,
                action=decision.get("action"),
            )
            return decision
        except Exception as e:
            logger.warning("Responder {id} LLM failed: {err}", id=self.id, err=str(e))
            return self._fallback(grid_snapshot)

    def _build_prompt(self, snap: dict) -> str:
        rs, re, cs, ce = self.sector
        return f"""You are an AI emergency responder managing a stadium evacuation.

SECTOR: rows {rs}-{re}, cols {cs}-{ce}
AGENTS IN SECTOR: {snap.get("agent_count", 0)}
FIRES IN SECTOR: {snap.get("fires", [])}
EXITS IN SECTOR: {snap.get("exits", [])}
NEARBY AGENTS HEADING: {snap.get("flow_hint", "toward nearest exit")}

Available actions:
1. redirect — change agent flow to avoid fire/congestion
2. deploy_barrier — place a wall to block dangerous path
3. open_exit — unlock an emergency exit
4. hold — no action needed

Respond ONLY with valid JSON:
{{"action": "...", "reasoning": "...", "target": [row, col]}}"""

    def _parse(self, raw: str) -> dict:
        try:
            start = raw.index("{")
            end = raw.rindex("}") + 1
            return json.loads(raw[start:end])
        except Exception as e:
            logger.warning("Evacuation responder parse failed: {}", e)
            return {"action": "hold", "reasoning": "parse fallback", "target": [0, 0]}

    def _fallback(self, snap: dict) -> dict:
        if snap.get("fires"):
            fires = snap["fires"]
            return {
                "action": "redirect",
                "reasoning": f"LLM unavailable. Rerouting around {len(fires)} fire(s).",
                "target": fires[0],
            }
        return {
            "action": "hold",
            "reasoning": "LLM unavailable, no hazards",
            "target": [0, 0],
        }
