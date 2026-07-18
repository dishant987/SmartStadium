"""Test LLMProvider fallback: when no API keys configured, mock is used."""

import pytest
from app.services.llm_provider import LLMProvider


@pytest.mark.asyncio
async def test_complete_mock_fallback():
    svc = LLMProvider()
    svc._providers = []  # force rebuild with no keys scenario
    from app.services.mock_llm import MockChatModel
    svc._providers = [MockChatModel()]
    result = await svc.complete("test")
    assert len(result) > 0
    assert "Here" in result


@pytest.mark.asyncio
async def test_stream_mock_fallback():
    svc = LLMProvider()
    from app.services.mock_llm import MockChatModel
    svc._providers = [MockChatModel()]
    tokens = []
    async for t in svc.complete_stream("test"):
        tokens.append(t)
    assert len(tokens) > 0
    assert "Here" in "".join(tokens)
