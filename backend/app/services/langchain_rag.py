"""LangChain-powered RAG over stadium knowledge base.

Uses ChromaDB vector store with sentence-transformers embeddings.
Gracefully falls back to empty context when Chroma is unavailable."""
from pathlib import Path
from dataclasses import dataclass

from app.config import settings
from app.utils.logger import logger

CHROMA_PERSIST_DIR = str(Path(__file__).resolve().parent.parent.parent / ".chroma_stadium")
COLLECTION_NAME = "stadium_knowledge"


@dataclass
class LangChainRAGService:
    _vector_store = None

    def _get_embeddings(self):
        if settings.gemini_api_key:
            try:
                from langchain_google_genai import GoogleGenerativeAIEmbeddings
                return GoogleGenerativeAIEmbeddings(
                    model="models/text-embedding-004",
                    google_api_key=settings.gemini_api_key
                )
            except Exception as e:
                logger.warning("Failed to initialize Google Generative AI Embeddings: {e}. Falling back to Mock.", e=e)
        
        # Fallback Mock Embeddings for tests / keyless environments
        from langchain_core.embeddings import Embeddings
        class MockEmbeddings(Embeddings):
            def embed_documents(self, texts: list[str]) -> list[list[float]]:
                return [[0.0] * 768 for _ in texts]
            def embed_query(self, text: str) -> list[float]:
                return [0.0] * 768
        return MockEmbeddings()

    def _get_vector_store(self):
        if LangChainRAGService._vector_store is not None:
            return LangChainRAGService._vector_store
        from langchain_chroma import Chroma
        embeddings = self._get_embeddings()
        try:
            store = Chroma(
                collection_name=COLLECTION_NAME,
                embedding_function=embeddings,
                persist_directory=CHROMA_PERSIST_DIR,
            )
        except Exception as e:
            logger.warning("Vector store load failed: {e}. Recreating collection.", e=e)
            import shutil
            try:
                shutil.rmtree(CHROMA_PERSIST_DIR, ignore_errors=True)
            except Exception:
                pass
            store = Chroma(
                collection_name=COLLECTION_NAME,
                embedding_function=embeddings,
                persist_directory=CHROMA_PERSIST_DIR,
            )
        LangChainRAGService._vector_store = store
        return store

    async def retrieve(self, query: str, top_k: int = 4) -> list[str]:
        try:
            store = self._get_vector_store()
            docs = store.similarity_search(query, k=top_k)
            results = [d.page_content for d in docs]
            logger.info("RAG retrieved {n} docs for: {q}", n=len(results), q=query[:60])
            return results
        except Exception as e:
            logger.warning("RAG retrieval failed: {err}", err=str(e))
            return []

    def add_documents(self, texts: list[str], metadatas: list[dict] | None = None):
        store = self._get_vector_store()
        store.add_texts(texts, metadatas=metadatas)
        logger.info("Added {n} documents to RAG store", n=len(texts))
