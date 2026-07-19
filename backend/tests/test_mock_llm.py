import pytest
from langchain_core.messages import HumanMessage
from app.services.mock_llm import MockChatModel


def test_mock_responds_about_gates():
    model = MockChatModel()
    msgs = [HumanMessage(content="Which gate should I use for wheelchair access?")]
    result = model._mock_response(msgs)
    assert "Gate A" in result or "Gate F" in result
    assert "ramp" in result.lower()


def test_mock_responds_about_transit():
    model = MockChatModel()
    msgs = [HumanMessage(content="How do I get to the stadium by train?")]
    result = model._mock_response(msgs)
    assert "NJ Transit" in result or "shuttle" in result


def test_mock_responds_about_food():
    model = MockChatModel()
    msgs = [HumanMessage(content="Where can I get food near section 105?")]
    result = model._mock_response(msgs)
    assert "concession" in result.lower() or "food" in result.lower()


def test_mock_responds_about_accessibility():
    model = MockChatModel()
    msgs = [HumanMessage(content="Is there wheelchair seating?")]
    result = model._mock_response(msgs)
    assert "Section" in result or "wheelchair" in result.lower()


def test_mock_responds_about_schedule():
    model = MockChatModel()
    msgs = [HumanMessage(content="What time does the match start?")]
    result = model._mock_response(msgs)
    assert "FIFA" in result or "kickoff" in result or "match" in result.lower()


def test_mock_fallback_for_unknown():
    model = MockChatModel()
    msgs = [HumanMessage(content="Tell me a joke")]
    result = model._mock_response(msgs)
    assert "Spectra" in result or "assistant" in result.lower()
