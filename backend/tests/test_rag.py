"""Test RAG retrieval (graceful degradation and normal path)."""

import pytest
from app.services.rag_service import RAGService


@pytest.mark.asyncio
async def test_retrieve_returns_list():
    svc = RAGService()
    result = await svc.retrieve("test query")
    assert isinstance(result, list)


@pytest.mark.asyncio
async def test_retrieve_with_query_returns_list():
    svc = RAGService()
    result = await svc.retrieve("stadium gates", top_k=3)
    assert isinstance(result, list)
