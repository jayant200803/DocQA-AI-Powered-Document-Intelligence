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
    llm_model: str = "gemini-flash-lite-latest"
    llm_temperature: float = 0.1
    llm_max_tokens: int = 1024

    # Chunking config
    chunk_size: int = 800
    chunk_overlap: int = 150

    # Retrieval config
    top_k: int = 5
    # CAG: if the selected documents total at most this many chunks, skip
    # retrieval and load them whole (context-augmented generation).
    cag_max_chunks: int = 12

    # Node.js server callback URL (AI service → Node.js after ingestion)
    server_callback_url: str = "http://localhost:5000"
    # Shared secret for the progress/status callbacks to the Node server.
    internal_api_secret: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
