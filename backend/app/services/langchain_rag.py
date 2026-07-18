"""LangChain-powered RAG over stadium knowledge base.

Uses ChromaDB vector store with sentence-transformers embeddings.
Gracefully falls back to empty context when Chroma is unavailable."""
import os
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
        from langchain_huggingface import HuggingFaceEmbeddings
        return HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )

    def _get_vector_store(self):
        if LangChainRAGService._vector_store is not None:
            return LangChainRAGService._vector_store
        from langchain_chroma import Chroma
        embeddings = self._get_embeddings()
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
