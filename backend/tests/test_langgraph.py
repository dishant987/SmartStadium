import pytest
from unittest.mock import MagicMock, patch, AsyncMock
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
async def test_agent_respond_with_compiled_graph():
    agent = LangGraphAgent()
    
    mock_graph = AsyncMock()
    mock_response_msg = MagicMock()
    mock_response_msg.content = "Answer from chatbot node"
    mock_graph.ainvoke.return_value = {"messages": [mock_response_msg]}
    
    agent._graph = mock_graph
    
    res = await agent.respond([{"role": "user", "content": "How are you?"}])
    assert res == "Answer from chatbot node"
    mock_graph.ainvoke.assert_called_once()

@pytest.mark.asyncio
async def test_agent_respond_graph_exception():
    agent = LangGraphAgent()
    mock_graph = AsyncMock()
    mock_graph.ainvoke.side_effect = Exception("Graph failed")
    agent._graph = mock_graph
    
    with patch.object(agent, "_fallback_chat", return_value="fallback response"):
        res = await agent.respond([{"role": "user", "content": "How are you?"}])
        assert res == "fallback response"

@pytest.mark.asyncio
async def test_agent_respond_stream_with_compiled_graph():
    agent = LangGraphAgent()
    
    async def mock_astream_events(*args, **kwargs):
        yield {
            "event": "on_chat_model_stream",
            "data": {
                "chunk": MagicMock(content="token1 ")
            }
        }
        yield {
            "event": "on_chat_model_stream",
            "data": {
                "chunk": MagicMock(content="token2")
            }
        }
        
    mock_graph = MagicMock()
    mock_graph.astream_events = mock_astream_events
    agent._graph = mock_graph
    
    chunks = []
    async for chunk in agent.respond_stream([{"role": "user", "content": "Hi"}]):
        chunks.append(chunk)
    assert "".join(chunks) == "token1 token2"

@pytest.mark.asyncio
async def test_agent_respond_stream_graph_exception():
    agent = LangGraphAgent()
    
    mock_graph = MagicMock()
    # To mock raise on astream_events iterator call:
    async def mock_raise_generator(*args, **kwargs):
        raise Exception("Stream error")
        yield "never-reached"
        
    mock_graph.astream_events = mock_raise_generator
    agent._graph = mock_graph
    
    with patch.object(agent, "_fallback_chat", return_value="fallback"):
        chunks = []
        async for chunk in agent.respond_stream([{"role": "user", "content": "Hi"}]):
            chunks.append(chunk)
        assert "".join(chunks) == "fallback"

def test_build_graph_bind_tools_success():
    agent = LangGraphAgent()
    mock_provider = MagicMock()
    mock_provider.bind_tools.return_value = MagicMock()
    agent.llm._providers = [mock_provider]
    
    with patch("app.services.langgraph_agent.StateGraph") as mock_state_graph:
        agent._build_graph()
        mock_provider.bind_tools.assert_called_once()
