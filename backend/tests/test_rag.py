"""Test RAG retrieval with no Chroma key configured (graceful degradation)."""

import pytest
from app.services.rag_service import RAGService


@pytest.mark.asyncio
async def test_retrieve_no_key_returns_empty():
    svc = RAGService()
    result = await svc.retrieve("test query")
    assert result == []


@pytest.mark.asyncio
async def test_retrieve_with_query_returns_list():
    svc = RAGService()
    result = await svc.retrieve("stadium gates", top_k=3)
    assert isinstance(result, list)
