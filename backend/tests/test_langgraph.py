"""Tests for the LangGraph agent (fallback path)."""
import pytest
from app.services.langgraph_agent import LangGraphAgent, stadium_knowledge, get_wayfinding


@pytest.mark.asyncio
async def test_fallback_responds():
    agent = LangGraphAgent()
    result = await agent.respond([{"role": "user", "content": "Hello"}])
    assert isinstance(result, str)
    assert len(result) > 0


@pytest.mark.asyncio
async def test_fallback_stream():
    agent = LangGraphAgent()
    chunks = []
    async for chunk in agent.respond_stream([{"role": "user", "content": "Hello"}]):
        chunks.append(chunk)
    assert len(chunks) > 0


@pytest.mark.asyncio
async def test_stadium_knowledge_tool():
    result = await stadium_knowledge("parking")
    assert isinstance(result, str)


@pytest.mark.asyncio
async def test_wayfinding_tool():
    result = await get_wayfinding("z1", "z3")
    assert isinstance(result, str)
    assert len(result) > 0
