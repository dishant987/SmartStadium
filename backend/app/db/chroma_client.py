import chromadb
from app.config import settings

_client = None


def get_chroma_client() -> chromadb.ClientAPI:
    global _client

    if _client is None:
        _client = chromadb.CloudClient(
            api_key=settings.chroma_api_key,
            tenant=settings.chroma_tenant,
            database=settings.chroma_database,
        )

    return _client
