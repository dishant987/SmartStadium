"""LangGraph agent for the AI Companion chat.

Provides a stateful graph with tools for RAG, wayfinding, transit,
crowd density, and wait times. Falls back gracefully when services fail."""
from typing import Annotated, AsyncGenerator, Literal
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, BaseMessage
from langchain_core.tools import tool

from app.services.langchain_rag import LangChainRAGService
from app.services.llm_provider import LLMProvider
from app.utils.logger import logger

SYSTEM_PROMPT = """You are StadiumSense, an expert AI assistant for the FIFA World Cup 2026 at MetLife Stadium. You help fans, staff, volunteers, and organizers.

You have tools to look up stadium knowledge, wayfinding routes, transit status, crowd density, and wait times. USE THEM when the user asks about anything related to the stadium — gates, sections, food, transit, accessibility, schedules, amenities.

Guidelines:
- Be concise, friendly, and specific.
- Use the RAG tool for stadium knowledge questions.
- Use transit/crowd/wait-time tools when the user asks about current conditions.
- If you don't know something, say so rather than guessing.
- Respond in the user's language when possible."""


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]


@tool
async def stadium_knowledge(query: str) -> str:
    """Retrieve information about MetLife Stadium: gates, sections, concessions, accessibility, transit, policies, amenities. Use for any stadium-related question."""
    rag = LangChainRAGService()
    docs = await rag.retrieve(query, top_k=3)
    if docs:
        return "\n\n".join(docs)
    return "No specific information found in the knowledge base."


@tool
async def get_wayfinding(from_zone: str, to_zone: str, accessible: bool = False) -> str:
    """Get walking directions between stadium zones. Zones: z1(Main Stand), z2(East Stand), z3(West Stand), z4(South Plaza), z5(Fan Zone). Set accessible=True for wheelchair routes."""
    from app.services.nav_service import NavService
    nav = NavService()
    try:
        result = nav.get_route(from_zone, to_zone, accessible)
        steps = result.get("steps", [])
        if steps:
            return " → ".join(s["instruction"] for s in steps)
        return "No route found between those zones."
    except Exception as e:
        return f"Route lookup failed: {e}"


@tool
async def get_transit_status() -> str:
    """Get current NJ Transit, shuttle, and bus status to/from MetLife Stadium."""
    from app.services.transport_service import TransportService
    svc = TransportService()
    status = await svc.get_status()
    lines = status.lines
    parts = [f"{l.name}: {l.status} (next: {l.next_departure or 'N/A'})" for l in lines]
    return "\n".join(parts)


@tool
async def get_crowd_density() -> str:
    """Get current crowd density in each stadium zone."""
    from app.services.ops_service import OpsService
    svc = OpsService()
    zones = await svc.get_crowd_density()
    return "\n".join(f"{z.name}: {z.density*100:.0f}% full ({z.capacity:,} capacity)" for z in zones)


@tool
async def get_wait_times(zone: str = "all") -> str:
    """Get current wait times for concessions, restrooms, and merchandise. Zone: z1-z5 or 'all'."""
    from app.services.wait_time_service import WaitTimeService
    from app.schemas.wait_time_schema import WaitTimeRequest
    svc = WaitTimeService()
    req = WaitTimeRequest(zone=zone, match_minute=30, match_status="in_progress")
    result = await svc.get_wait_times(req)
    lines = [f"{loc.name} ({loc.type}): {loc.current_wait_min}min - {loc.recommendation}" for loc in result.locations]
    return "\n".join(lines[:6])


tools = [stadium_knowledge, get_wayfinding, get_transit_status, get_crowd_density, get_wait_times]


class LangGraphAgent:
    def __init__(self):
        self.llm = LLMProvider()
        self._build_graph()

    def _build_graph(self):
        llm_with_tools = None
        for provider in self.llm._providers:
            try:
                llm_with_tools = provider.bind_tools(tools)
                break
            except Exception:
                continue
        if llm_with_tools is None:
            self._graph = None
            return

        graph_builder = StateGraph(AgentState)

        def chatbot(state: AgentState):
            msgs = [SystemMessage(content=SYSTEM_PROMPT)] + state["messages"]
            return {"messages": [llm_with_tools.invoke(msgs)]}

        graph_builder.add_node("chatbot", chatbot)
        tool_node = ToolNode(tools)
        graph_builder.add_node("tools", tool_node)
        graph_builder.add_conditional_edges("chatbot", tools_condition)
        graph_builder.add_edge("tools", "chatbot")
        graph_builder.set_entry_point("chatbot")
        self._graph = graph_builder.compile()

    async def respond(self, messages: list[dict]) -> str:
        if self._graph is None:
            return await self._fallback_chat(messages)
        try:
            input_msgs = [HumanMessage(content=m["content"]) if m["role"] == "user" else AIMessage(content=m["content"]) for m in messages[-6:]]
            result = await self._graph.ainvoke({"messages": input_msgs})
            return result["messages"][-1].content
        except Exception as e:
            logger.error("LangGraph agent failed: {err}", err=str(e))
            return await self._fallback_chat(messages)

    async def respond_stream(self, messages: list[dict]) -> AsyncGenerator[str, None]:
        if self._graph is None:
            text = await self._fallback_chat(messages)
            for char in text:
                yield char
            return
        try:
            input_msgs = [HumanMessage(content=m["content"]) if m["role"] == "user" else AIMessage(content=m["content"]) for m in messages[-6:]]
            async for event in self._graph.astream_events({"messages": input_msgs}, version="v2"):
                if event["event"] == "on_chat_model_stream" and "chunk" in event["data"]["metadata"]:
                    chunk = event["data"]["chunk"]
                    if content := chunk.content:
                        yield content
        except Exception as e:
            logger.error("LangGraph stream failed: {err}", err=str(e))
            text = await self._fallback_chat(messages)
            for char in text:
                yield char

    async def _fallback_chat(self, messages: list[dict]) -> str:
        last_user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "Hello")
        prompt = f"{SYSTEM_PROMPT}\n\nUser: {last_user}"
        return await self.llm.complete(prompt)

    def bind_langgraph(self, model):
        """For use outside this class — expose the compiled graph."""
        return self._graph
