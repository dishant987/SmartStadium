"""LangChain-based LLM provider with automatic failover.

Replaces the old httpx-based LLMRouterService with LangChain chat models.
Tries Groq → Gemini → Mistral, falls back to mock when no keys configured."""
from dataclasses import dataclass, field
from typing import AsyncGenerator

from langchain_core.messages import HumanMessage, BaseMessage
from langchain_core.language_models.chat_models import BaseChatModel

from app.config import settings
from app.services.mock_llm import MockChatModel
from app.utils.logger import logger

try:
    from langchain_groq import ChatGroq
except ImportError:
    ChatGroq = None  # ponytail: optional provider
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
except ImportError:
    ChatGoogleGenerativeAI = None
try:
    from langchain_mistralai import ChatMistralAI
except ImportError:
    ChatMistralAI = None

try:
    from langchain_openai import ChatOpenAI
except ImportError:
    ChatOpenAI = None


def _build_providers() -> list[BaseChatModel]:
    providers: list[BaseChatModel] = []
    if settings.groq_api_key and ChatGroq:
        providers.append(ChatGroq(model="llama-3.3-70b-versatile", api_key=settings.groq_api_key, temperature=0.3))
    if settings.gemini_api_key and ChatGoogleGenerativeAI:
        providers.append(ChatGoogleGenerativeAI(model="gemini-2.5-flash", api_key=settings.gemini_api_key, temperature=0.3))
    if settings.mistral_api_key and ChatMistralAI:
        providers.append(ChatMistralAI(model="mistral-large-latest", api_key=settings.mistral_api_key, temperature=0.3))
    if settings.openrouter_api_key and ChatOpenAI:
        providers.append(ChatOpenAI(
            model="qwen/qwen3-coder:free",
            api_key=settings.openrouter_api_key,
            base_url="https://openrouter.ai/api/v1",
            temperature=0.2,
    max_retries=2,
        ))
    if not providers:
        providers.append(MockChatModel())
    return providers


@dataclass
class LLMProvider:
    _providers: list = field(default_factory=_build_providers)

    def _get_messages(self, prompt: str) -> list[BaseMessage]:
        return [HumanMessage(content=prompt)]

    async def complete(self, prompt: str, system_prompt: str | None = None) -> str:
        messages = [HumanMessage(content=prompt)]
        for provider in self._providers:
            try:
                result = await provider.ainvoke(messages)
                return result.content
            except Exception as e:
                logger.warning("Provider {p} failed: {err}", p=type(provider).__name__, err=str(e))
        return "I'm having trouble connecting right now. Please try again."

    async def complete_stream(self, prompt: str, system_prompt: str | None = None) -> AsyncGenerator[str, None]:
        messages = [HumanMessage(content=prompt)]
        for provider in self._providers:
            try:
                async for chunk in provider.astream(messages):
                    if content := chunk.content:
                        yield content
                return
            except Exception as e:
                logger.warning("Stream provider {p} failed: {err}", p=type(provider).__name__, err=str(e))
        yield "I'm having trouble connecting right now. Please try again."
