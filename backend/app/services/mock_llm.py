"""Mock chat model for demo when no API keys are configured."""

from typing import Any, AsyncIterator, Iterator, List
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, AIMessageChunk
from langchain_core.outputs import ChatGeneration, ChatResult, ChatGenerationChunk


class MockChatModel(BaseChatModel):
    """Returns canned responses so the demo works without API keys."""

    def _generate(
        self, messages: List[BaseMessage], stop: List[str] | None = None, run_manager: CallbackManagerForLLMRun | None = None, **kwargs: Any
    ) -> ChatResult:
        return ChatResult(generations=[ChatGeneration(message=AIMessage(content=self._mock_response(messages)))])

    async def _agenerate(
        self, messages: List[BaseMessage], stop: List[str] | None = None, run_manager: CallbackManagerForLLMRun | None = None, **kwargs: Any
    ) -> ChatResult:
        return self._generate(messages, stop, run_manager, **kwargs)

    def _stream(self, messages: List[BaseMessage], stop: List[str] | None = None, run_manager: CallbackManagerForLLMRun | None = None, **kwargs: Any) -> Iterator[ChatGenerationChunk]:
        for token in self._mock_stream():
            yield ChatGenerationChunk(message=AIMessageChunk(content=token))

    async def _astream(self, messages: List[BaseMessage], stop: List[str] | None = None, run_manager: CallbackManagerForLLMRun | None = None, **kwargs: Any) -> AsyncIterator[ChatGenerationChunk]:
        import asyncio
        for token in self._mock_stream():
            yield ChatGenerationChunk(message=AIMessageChunk(content=token))
            await asyncio.sleep(0.03)

    @property
    def _llm_type(self) -> str:
        return "mock"

    def _mock_response(self, messages: List[BaseMessage]) -> str:
        return "Here is the information you requested about the FIFA tournament. The match is scheduled at MetLife Stadium. Gates open 2 hours before kickoff. For specific questions, please ask about gates, transit, food, or accessibility."

    def _mock_stream(self) -> list[str]:
        return [
            "Here", " is", " the", " information", " you", " requested", " about",
            " the", " FIFA", " tournament", " at", " MetLife", " Stadium", ".",
            "\n\n", "Gates", " open", " 2", " hours", " before", " kickoff", ".",
            "\n", "Is", " there", " something", " specific", " you'd", " like", " to", " know", "?",
        ]
