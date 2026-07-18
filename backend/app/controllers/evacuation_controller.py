import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.evacuation.engine import SimulationEngine
from app.utils.logger import logger

router = APIRouter()

# ponytail: single shared engine per server instance
engine = SimulationEngine()
connected_clients: set[WebSocket] = set()


async def broadcast(state: dict):
    dead: list[WebSocket] = []
    payload = json.dumps(state, default=str)
    for ws in connected_clients:
        try:
            await ws.send_text(payload)
        except Exception:
            dead.append(ws)
    for ws in dead:
        connected_clients.discard(ws)


@router.websocket("/ws/evacuation")
async def evacuation_ws(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    logger.info("Client connected. Total: {n}", n=len(connected_clients))

    sim_task = None

    try:
        # send initial state
        await websocket.send_text(json.dumps(engine.get_state(), default=str))

        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            msg_type = msg.get("type", "")

            if msg_type == "start":
                if not engine.running:
                    engine.running = True
                    sim_task = asyncio.create_task(engine.run(broadcast))

            elif msg_type == "stop":
                engine.running = False
                if sim_task:
                    sim_task.cancel()
                    sim_task = None

            elif msg_type == "inject_fire":
                row, col = msg.get("row", 0), msg.get("col", 0)
                engine.inject_fire(row, col)
                await websocket.send_text(
                    json.dumps(
                        {"type": "ack", "action": "fire", "row": row, "col": col}
                    )
                )

            elif msg_type == "inject_obstacle":
                row, col = msg.get("row", 0), msg.get("col", 0)
                engine.inject_obstacle(row, col)

            elif msg_type == "reset":
                engine.running = False
                if sim_task:
                    sim_task.cancel()
                    sim_task = None
                engine.reset()
                await websocket.send_text(json.dumps(engine.get_state(), default=str))

            elif msg_type == "state":
                await websocket.send_text(json.dumps(engine.get_state(), default=str))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error("WS error: {err}", err=str(e))
    finally:
        connected_clients.discard(websocket)
        logger.info("Client disconnected. Total: {n}", n=len(connected_clients))
