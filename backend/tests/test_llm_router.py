import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from app.services.llm_provider import LLMProvider, _build_providers


@pytest.mark.asyncio
async def test_complete_mock_fallback():
    svc = LLMProvider()
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


def test_build_providers_with_all_keys():
    with patch("app.services.llm_provider.settings") as mock_settings, \
         patch("app.services.llm_provider.ChatGroq") as mock_groq, \
         patch("app.services.llm_provider.ChatGoogleGenerativeAI") as mock_gemini, \
         patch("app.services.llm_provider.ChatMistralAI") as mock_mistral, \
         patch("app.services.llm_provider.ChatOpenAI") as mock_openai:
        
        mock_settings.groq_api_key = "groq-key"
        mock_settings.gemini_api_key = "gemini-key"
        mock_settings.mistral_api_key = "mistral-key"
        mock_settings.openrouter_api_key = "openrouter-key"
        
        providers = _build_providers()
        assert len(providers) == 4
        mock_groq.assert_called_once()
        mock_gemini.assert_called_once()
        mock_mistral.assert_called_once()
        mock_openai.assert_called_once()


@pytest.mark.asyncio
async def test_complete_provider_failover():
    # First provider fails, second succeeds
    prov1 = MagicMock()
    prov1.ainvoke = AsyncMock(side_effect=Exception("API limit exceeded"))
    
    prov2 = MagicMock()
    mock_response = MagicMock()
    mock_response.content = "Success answer"
    prov2.ainvoke = AsyncMock(return_value=mock_response)
    
    svc = LLMProvider()
    svc._providers = [prov1, prov2]
    
    res = await svc.complete("test")
    assert res == "Success answer"


@pytest.mark.asyncio
async def test_complete_all_providers_fail():
    prov1 = MagicMock()
    prov1.ainvoke = AsyncMock(side_effect=Exception("API limit exceeded"))
    
    svc = LLMProvider()
    svc._providers = [prov1]
    
    res = await svc.complete("test")
    assert "trouble connecting" in res


@pytest.mark.asyncio
async def test_stream_provider_failover():
    prov1 = MagicMock()
    prov1.astream = MagicMock(side_effect=Exception("Stream error"))
    
    # Mock successful streaming provider
    async def mock_astream(messages):
        yield MagicMock(content="Part 1 ")
        yield MagicMock(content="Part 2")
        
    prov2 = MagicMock()
    prov2.astream = mock_astream
    
    svc = LLMProvider()
    svc._providers = [prov1, prov2]
    
    tokens = []
    async for chunk in svc.complete_stream("test"):
        tokens.append(chunk)
    assert "".join(tokens) == "Part 1 Part 2"


@pytest.mark.asyncio
async def test_stream_all_providers_fail():
    prov1 = MagicMock()
    prov1.astream = MagicMock(side_effect=Exception("Stream error"))
    
    svc = LLMProvider()
    svc._providers = [prov1]
    
    tokens = []
    async for chunk in svc.complete_stream("test"):
        tokens.append(chunk)
    assert "trouble connecting" in "".join(tokens)
