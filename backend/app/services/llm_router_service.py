"""LLM routing with automatic failover across providers.

Tries providers in order (Groq -> Gemini -> Mistral) and falls through on
failure. When no API keys are configured, falls back to a local mock that
returns canned tokens so the demo always works without credentials."""

import json
from dataclasses import dataclass

import httpx

from app.config import settings
from app.utils.exceptions import LLMProviderError
from app.utils.logger import logger


@dataclass
class LLMRouterService:
    async def _stream_groq(self, prompt: str):
        if not settings.groq_api_key:
            raise LLMProviderError("Groq API key not configured")
        async with httpx.AsyncClient(timeout=60) as client:
            async with client.stream(
                "POST",
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.groq_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": True,
                },
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line.startswith("data: ") and not line.startswith(
                        "data: [DONE]"
                    ):
                        chunk = json.loads(line[6:])
                        delta = chunk.get("choices", [{}])[0].get("delta", {})
                        if token := delta.get("content"):
                            yield token

    async def _stream_gemini(self, prompt: str):
        if not settings.gemini_api_key:
            raise LLMProviderError("Gemini API key not configured")
        async with httpx.AsyncClient(timeout=60) as client:
            async with client.stream(
                "POST",
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key={settings.gemini_api_key}",
                json={"contents": [{"parts": [{"text": prompt}]}]},
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line.startswith("data: "):
                        chunk = json.loads(line[6:])
                        parts = (
                            chunk.get("candidates", [{}])[0]
                            .get("content", {})
                            .get("parts", [])
                        )
                        if parts and (text := parts[0].get("text")):
                            yield text

    async def _stream_mistral(self, prompt: str):
        if not settings.mistral_api_key:
            raise LLMProviderError("Mistral API key not configured")
        async with httpx.AsyncClient(timeout=60) as client:
            async with client.stream(
                "POST",
                "https://api.mistral.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.mistral_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "mistral-large-latest",
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": True,
                },
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line.startswith("data: ") and not line.startswith(
                        "data: [DONE]"
                    ):
                        chunk = json.loads(line[6:])
                        delta = chunk.get("choices", [{}])[0].get("delta", {})
                        if token := delta.get("content"):
                            yield token

    # ponytail: mock fallback when no API keys are configured
    MOCK_TOKENS = [
        "Here",
        " is",
        " the",
        " information",
        " you",
        " requested",
        " about",
        " the",
        " FIFA",
        " tournament",
        ".",
        "\n\n",
        "The",
        " match",
        " is",
        " scheduled",
        " at",
        " Estádio",
        " Nacional",
        ".",
        "\n",
        "Gates",
        " open",
        " 2",
        " hours",
        " before",
        " kickoff",
        ".",
    ]

    async def _stream_mock(self, prompt: str):
        for token in self.MOCK_TOKENS:
            yield token
            import asyncio

            await asyncio.sleep(0.05)

    async def complete(self, prompt: str) -> str:
        providers = [
            ("groq", self._stream_groq),
            ("gemini", self._stream_gemini),
            ("mistral", self._stream_mistral),
        ]
        has_any_key = any(
            [settings.groq_api_key, settings.gemini_api_key, settings.mistral_api_key]
        )
        if not has_any_key:
            full = "".join([t async for t in self._stream_mock(prompt)])
            return full
        for name, fn in providers:
            try:
                tokens = []
                async for token in fn(prompt):
                    tokens.append(token)
                logger.info("LLM {name} completed", name=name)
                return "".join(tokens)
            except LLMProviderError:
                logger.warning(
                    "LLM {name} unavailable (no key), trying next", name=name
                )
            except Exception as e:
                logger.warning(
                    "LLM {name} failed: {err}, trying next", name=name, err=str(e)
                )
        raise LLMProviderError()

    async def complete_stream(self, prompt: str):
        providers = [
            ("groq", self._stream_groq),
            ("gemini", self._stream_gemini),
            ("mistral", self._stream_mistral),
        ]
        has_any_key = any(
            [settings.groq_api_key, settings.gemini_api_key, settings.mistral_api_key]
        )
        if not has_any_key:
            async for token in self._stream_mock(prompt):
                yield token
            return
        for name, fn in providers:
            try:
                async for token in fn(prompt):
                    yield token
                return
            except LLMProviderError:
                logger.warning(
                    "LLM stream {name} unavailable (no key), trying next", name=name
                )
            except Exception as e:
                logger.error(
                    "LLM stream {name} failed mid-stream: {err}", name=name, err=str(e)
                )
                yield "\n\n[Connection interrupted — trying backup provider...]\n\n"
        yield "Our assistant is having trouble right now — please try again in a moment."
