"""Mock chat model for demo when no API keys are configured."""

import asyncio
from typing import Any, AsyncIterator, Iterator, List
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage, AIMessageChunk
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
        for token in self._mock_stream(messages):
            yield ChatGenerationChunk(message=AIMessageChunk(content=token))

    async def _astream(self, messages: List[BaseMessage], stop: List[str] | None = None, run_manager: CallbackManagerForLLMRun | None = None, **kwargs: Any) -> AsyncIterator[ChatGenerationChunk]:
        for token in self._mock_stream(messages):
            yield ChatGenerationChunk(message=AIMessageChunk(content=token))
            await asyncio.sleep(0.03)

    @property
    def _llm_type(self) -> str:
        return "mock"

    def _mock_response(self, messages: List[BaseMessage]) -> str:
        last = messages[-1].content.lower() if messages else ""
        if "gate" in last or "entrance" in last:
            return (
                "MetLife Stadium has 6 main gates: **Gate A** (East Lot - accessible entrance), "
                "**Gate B** (North - VIP & suites), **Gate C** (South - general admission), "
                "**Gate D** (West - shuttle drop-off), **Gate E** (Southeast - family entry), "
                "and **Gate F** (Southwest - ADA accessible).\n\n"
                "📍 Tip: Gates A and F have wheelchair ramps. Gates open 2 hours before kickoff."
            )
        if "transit" in last or "train" in last or "transport" in last or "shuttle" in last:
            return (
                "🚇 **Getting to MetLife Stadium:**\n\n"
                "**NJ Transit Meadowlands Rail Line** runs from Secaucus Junction directly to the stadium — "
                "service begins 3 hours before kickoff and runs every 10-15 minutes.\n\n"
                "**Shuttles** run from Port Authority Bus Terminal (Gate 51) starting 4 hours pre-match. "
                "Round-trip is $12.\n\n"
                "**Parking** lots open 4 hours before the match. Pre-paid parking is recommended."
            )
        if "food" in last or "concession" in last or "drink" in last or "eat" in last:
            return (
                "🍔 **Stadium Concessions at MetLife:**\n\n"
                "There are **over 50 concession stands** across 4 concourses. Fan favorites include:\n"
                "- **MetLife Market** (Sections 105, 215, 325) — craft beer & local fare\n"
                "- **Taste of the World** (Section 120) — international cuisine\n"
                "- **Grab & Go** kiosks on every level for quick service\n\n"
                "⏱️ Current wait times average 4-8 minutes depending on the zone."
            )
        if "access" in last or "wheelchair" in last or "disability" in last or "elevator" in last:
            return (
                "♿ **Accessibility at MetLife Stadium:**\n\n"
                "Wheelchair-accessible seating is available in **Sections 115, 218, and 320**. "
                "Elevators are located at **North Lobby, Gate D, and 200 Club level**.\n\n"
                "All gates have ramps. Assistive listening devices are available at the **Info Desk (Gate A)**. "
                "Service animal relief areas are at **East Plaza and Lot J**."
            )
        if "schedule" in last or "match" in last or "game" in last or "kickoff" in last:
            return (
                "⚽ **FIFA World Cup 2026 at MetLife Stadium — Match Schedule:**\n\n"
                "Today's featured matches:\n"
                "- **Group Stage**: 16:00 ET — Brazil vs. Germany (Gates open 14:00)\n"
                "- **Group Stage**: 20:00 ET — Argentina vs. France (Gates open 18:00)\n\n"
                "All times Eastern. Arrive early — security screening takes 10-15 minutes during peak periods."
            )
        return (
            "I'm Spectra, your AI assistant for the FIFA World Cup 2026 at MetLife Stadium! 🏟️\n\n"
            "I can help you with:\n"
            "- **Wayfinding & Navigation** — directions between zones\n"
            "- **Transit & Parking** — trains, shuttles, and lots\n"
            "- **Concessions & Wait Times** — food options and queue estimates\n"
            "- **Accessibility** — ramps, elevators, and ADA services\n"
            "- **Match Info & Schedules** — kickoff times and gate openings\n"
            "- **Crowd Density** — live capacity per zone\n\n"
            "What would you like to know?"
        )

    def _mock_stream(self, messages: List[BaseMessage] | None = None) -> list[str]:
        text = self._mock_response(messages or [])
        return [text[i:i+3] for i in range(0, len(text), 3)]
