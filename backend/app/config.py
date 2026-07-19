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
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    cloudinary_url: str = ""

    model_config = {"env_file": ".env", "case_sensitive": False}


settings = Settings()
