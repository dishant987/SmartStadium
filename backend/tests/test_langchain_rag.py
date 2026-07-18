import pytest
from unittest.mock import MagicMock, patch
from app.services.langchain_rag import LangChainRAGService

@pytest.mark.asyncio
async def test_langchain_rag_fallback():
    # Test retrieve with fallback when chroma is not configured or fails
    svc = LangChainRAGService()
    
    # We patch _get_vector_store to raise an exception or return mocked store
    with patch.object(svc, "_get_vector_store", side_effect=Exception("Chroma connection error")):
        docs = await svc.retrieve("Where is gate A?")
        assert docs == []

@pytest.mark.asyncio
async def test_langchain_rag_retrieve_success():
    svc = LangChainRAGService()
    
    mock_doc = MagicMock()
    mock_doc.page_content = "Gate A is open from 2 PM"
    
    mock_store = MagicMock()
    mock_store.similarity_search.return_value = [mock_doc]
    
    with patch.object(svc, "_get_vector_store", return_value=mock_store):
        docs = await svc.retrieve("Gate A opening times", top_k=1)
        assert len(docs) == 1
        assert docs[0] == "Gate A is open from 2 PM"
        mock_store.similarity_search.assert_called_once_with("Gate A opening times", k=1)

def test_langchain_rag_add_documents():
    svc = LangChainRAGService()
    mock_store = MagicMock()
    
    with patch.object(svc, "_get_vector_store", return_value=mock_store):
        svc.add_documents(["Document 1", "Document 2"], [{"source": "manual"}, {"source": "web"}])
        mock_store.add_texts.assert_called_once_with(["Document 1", "Document 2"], metadatas=[{"source": "manual"}, {"source": "web"}])
