"""Tests for the LangGraph agent (fallback path)."""
import pytest
from app.services.langgraph_agent import LangGraphAgent


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
async def test_langgraph_agent_responds_to_greeting():
    agent = LangGraphAgent()
    result = await agent.respond([{"role": "user", "content": "Hello"}])
    assert isinstance(result, str)
    assert len(result) > 0


@pytest.mark.asyncio
async def test_langgraph_agent_streams():
    agent = LangGraphAgent()
    chunks = []
    async for chunk in agent.respond_stream([{"role": "user", "content": "Hello"}]):
        chunks.append(chunk)
    assert len(chunks) > 0
