from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    google_api_key: str = ""
    pinecone_api_key: str = ""
    pinecone_index: str = "rag-doc-qa"
    pinecone_environment: str = "us-east-1"

    # Model config
    embedding_model: str = "gemini-embedding-001"
    embedding_dimensions: int = 768
    llm_model: str = "gemini-2.5-flash"
    llm_temperature: float = 0.1
    llm_max_tokens: int = 1024

    # Chunking config
    chunk_size: int = 800
    chunk_overlap: int = 150

    # Retrieval config
    top_k: int = 5

    # Node.js server callback URL (AI service → Node.js after ingestion)
    server_callback_url: str = "http://localhost:5000"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
