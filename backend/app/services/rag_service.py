from dataclasses import dataclass

from app.config import settings
from app.db.chroma_client import get_chroma_client
from app.utils.logger import logger

"""Retrieval-Augmented Generation over stadium knowledge base.

Queries a Chroma vector store for relevant context documents about the
FIFA 2026 venue, gates, transit, accessibility, and matchday operations.
Returns up to top_k chunks; empty list when Chroma is not configured so
the app degrades gracefully without RAG."""

COLLECTION = "stadium_knowledge"


@dataclass
class RAGService:
    async def retrieve(self, query: str, top_k: int = 3) -> list[str]:
        if not settings.chroma_api_key:
            return []
        try:
            client = get_chroma_client()
            collection = client.get_collection(COLLECTION)
            results = collection.query(query_texts=[query], n_results=top_k)
            docs = results["documents"][0] if results.get("documents") else []
            if docs:
                logger.info(
                    "RAG retrieved {count} docs for query: {q}",
                    count=len(docs),
                    q=query[:50],
                )
            return docs
        except Exception as e:
            logger.warning("RAG retrieval failed: {err}", err=str(e))
            return []
