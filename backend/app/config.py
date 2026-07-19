from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    neon_database_url: str = ""
    chroma_api_key: str = ""
    chroma_tenant: str = ""
    chroma_database: str = ""
    chroma_host: str = "api.chroma.cloud"
    chroma_port: str = "443"
    groq_api_key: str = ""
    gemini_api_key: str = ""
    mistral_api_key: str = ""
    cors_origins: str = "http://localhost:5173,http://localhost:4173"
    jwt_secret: str = ""
    openrouter_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    gemini_model: str = "gemini-2.5-flash"
    mistral_model: str = "mistral-large-latest"
    openrouter_model: str = "tencent/hy3:free"
    gemini_embedding_model: str = "models/gemini-embedding-001"

    model_config = {"env_file": ".env", "case_sensitive": False, "extra": "ignore"}


settings = Settings()
