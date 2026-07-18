"""LangChain-based LLM provider with automatic failover.

Replaces the old httpx-based LLMRouterService with LangChain chat models.
Tries Groq → Gemini → Mistral, falls back to mock when no keys configured."""
from dataclasses import dataclass, field
from typing import AsyncGenerator

from langchain_core.messages import AIMessage, HumanMessage, BaseMessage
from langchain_core.language_models.chat_models import BaseChatModel

from app.config import settings
from app.utils.logger import logger


def _build_providers() -> list[BaseChatModel]:
    providers: list[BaseChatModel] = []
    if settings.groq_api_key:
        try:
            from langchain_groq import ChatGroq
            providers.append(ChatGroq(model="llama-3.3-70b-versatile", api_key=settings.groq_api_key, temperature=0.3))
        except ImportError:
            logger.warning("langchain-groq not installed, skipping")
    if settings.gemini_api_key:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            providers.append(ChatGoogleGenerativeAI(model="gemini-2.0-flash", api_key=settings.gemini_api_key, temperature=0.3))
        except ImportError:
            logger.warning("langchain-google-genai not installed, skipping")
    if settings.mistral_api_key:
        try:
            from langchain_mistralai import ChatMistralAI
            providers.append(ChatMistralAI(model="mistral-large-latest", api_key=settings.mistral_api_key, temperature=0.3))
        except ImportError:
            logger.warning("langchain-mistralai not installed, skipping")
    if not providers:
        from app.services.mock_llm import MockChatModel
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
