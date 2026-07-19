import pytest
import shutil
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

def test_get_embeddings_with_gemini_key():
    svc = LangChainRAGService()
    with patch("app.services.langchain_rag.settings") as mock_settings:
        mock_settings.gemini_api_key = "fake-gemini-key"
        with patch("langchain_google_genai.GoogleGenerativeAIEmbeddings") as mock_genai:
            embeddings = svc._get_embeddings()
            assert embeddings is not None

def test_get_embeddings_fallback_on_import_error():
    svc = LangChainRAGService()
    with patch("app.services.langchain_rag.settings") as mock_settings:
        mock_settings.gemini_api_key = "fake-gemini-key"
        # Mock initialization failure of GoogleGenerativeAIEmbeddings
        with patch("langchain_google_genai.GoogleGenerativeAIEmbeddings", side_effect=Exception("Failed")):
            embeddings = svc._get_embeddings()
            # It should return MockEmbeddings
            assert embeddings.embed_query("test") == [0.0] * 768
            assert embeddings.embed_documents(["test"]) == [[0.0] * 768]

def test_get_embeddings_no_gemini_key():
    svc = LangChainRAGService()
    with patch("app.services.langchain_rag.settings") as mock_settings:
        mock_settings.gemini_api_key = ""
        embeddings = svc._get_embeddings()
        assert embeddings.embed_query("test") == [0.0] * 768

def test_get_vector_store_cached():
    svc = LangChainRAGService()
    svc._vector_store = "cached_store"
    assert svc._get_vector_store() == "cached_store"
    # reset for other tests
    svc._vector_store = None

def test_get_vector_store_fails_and_rmtree():
    svc = LangChainRAGService()
    svc._vector_store = None
    with patch("langchain_chroma.Chroma", side_effect=[Exception("Dimensionality mismatch"), MagicMock()]) as mock_chroma, \
         patch("shutil.rmtree") as mock_rmtree, \
         patch.object(svc, "_get_embeddings", return_value=MagicMock()):
        store = svc._get_vector_store()
        assert store is not None
        mock_rmtree.assert_called_once()
        assert mock_chroma.call_count == 2
