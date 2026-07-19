"""WebSocket endpoint for real-time stadium data.

Streams crowd density, transit, and wait-time updates at configurable intervals.
Also provides operational analysis from the OpsLangGraph agent."""
import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.realtime_service import RealtimeSimulator, OpsLangGraphAgent
from app.utils.logger import logger

router = APIRouter()
simulator = RealtimeSimulator()
ops_agent = OpsLangGraphAgent()
connected: set[WebSocket] = set()


async def broadcast(payload: dict, exclude: WebSocket | None = None) -> None:
    dead: list[WebSocket] = []
    msg = json.dumps(payload, default=str)
    for ws in connected:
        if ws is exclude:
            continue
        try:
            await ws.send_text(msg)
        except Exception as e:
            logger.warning("Realtime WS send failed: {}", e)
            dead.append(ws)
    for ws in dead:
        connected.discard(ws)


async def _broadcast_loop(interval: float = 2.0) -> None:
    """Push state updates to all connected clients every `interval` seconds."""
    while True:
        await asyncio.sleep(interval)
        state = simulator.get_state()
        analysis = await ops_agent.analyze(state)
        state["analysis"] = analysis
        await broadcast(state)


_broadcast_task: asyncio.Task | None = None


@router.websocket("/ws/realtime")
async def realtime_ws(websocket: WebSocket) -> None:
    global _broadcast_task
    await websocket.accept()
    connected.add(websocket)
    logger.info("Realtime client connected. Total: {n}", n=len(connected))

    if _broadcast_task is None or _broadcast_task.done():
        _broadcast_task = asyncio.create_task(_broadcast_loop(2.0))

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            t = msg.get("type", "")

            if t == "state":
                state = simulator.get_state()
                analysis = await ops_agent.analyze(state)
                state["analysis"] = analysis
                await websocket.send_text(json.dumps(state, default=str))

            elif t == "set_status":
                if "match_status" in msg:
                    simulator._match_status = msg["match_status"]
                await websocket.send_text(json.dumps({"type": "ack", "match_status": simulator._match_status}))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error("Realtime WS error: {err}", err=str(e))
    finally:
        connected.discard(websocket)
        logger.info("Realtime client disconnected. Total: {n}", n=len(connected))
