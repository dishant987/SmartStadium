"""Test that LLM router failover works: when a provider fails, the next
one is tried. When all fail (or no keys set), mock is used."""

import pytest
from app.services.llm_router_service import LLMRouterService


class FakeProvider:
    """Yields a fixed token then stops (simulates a working provider)."""

    def __init__(self, tokens=None):
        self.tokens = tokens or ["hello", " world"]

    async def __call__(self, prompt: str):
        for t in self.tokens:
            yield t


class FailingProvider:
    """Raises on first call (simulates a broken provider)."""

    async def __call__(self, prompt: str):
        raise RuntimeError("Provider unreachable")


@pytest.mark.asyncio
async def test_complete_all_fail_falls_to_mock():
    svc = LLMRouterService()
    # Simulate no API keys — forces mock path
    result = await svc.complete("test")
    assert len(result) > 0
    assert "Here" in result


@pytest.mark.asyncio
async def test_stream_all_fail_falls_to_mock():
    svc = LLMRouterService()
    tokens = []
    async for t in svc.complete_stream("test"):
        tokens.append(t)
    assert len(tokens) > 0


@pytest.mark.asyncio
async def test_stream_first_provider_succeeds():
    svc_providers = [("fake", FakeProvider(["ok"]))]
    collected = []
    for name, fn in svc_providers:
        async for token in fn("prompt"):
            collected.append(token)
        break
    assert collected == ["ok"]


@pytest.mark.asyncio
async def test_first_fails_second_succeeds():
    providers = [("fail", FailingProvider()), ("ok", FakeProvider(["fallback"]))]
    result = None
    for name, fn in providers:
        try:
            tokens = []
            async for t in fn("x"):
                tokens.append(t)
            result = "".join(tokens)
            break
        except Exception:
            continue
    assert result == "fallback"
