import httpx
from app.config.settings import get_settings

_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for a list of texts using Gemini text-embedding-004.
    Uses v1beta REST API with key as query param (required for AI Studio keys).
    """
    settings = get_settings()
    model = settings.embedding_model

    all_embeddings: list[list[float]] = []
    batch_size = 100

    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]

        payload = {
            "requests": [
                {
                    "model": f"models/{model}",
                    "content": {"parts": [{"text": t}]},
                    "taskType": "RETRIEVAL_DOCUMENT",
                    "outputDimensionality": settings.embedding_dimensions,
                }
                for t in batch
            ]
        }

        response = httpx.post(
            f"{_BASE}/{model}:batchEmbedContents",
            params={"key": settings.google_api_key},
            json=payload,
            timeout=60.0,
        )
        response.raise_for_status()
        all_embeddings.extend(
            emb["values"] for emb in response.json()["embeddings"]
        )

    return all_embeddings


def generate_single_embedding(text: str) -> list[float]:
    """Generate embedding for a single query text."""
    settings = get_settings()
    model = settings.embedding_model

    response = httpx.post(
        f"{_BASE}/{model}:embedContent",
        params={"key": settings.google_api_key},
        json={
            "model": f"models/{model}",
            "content": {"parts": [{"text": text}]},
            "taskType": "RETRIEVAL_QUERY",
            "outputDimensionality": settings.embedding_dimensions,
        },
        timeout=30.0,
    )
    response.raise_for_status()
    return response.json()["embedding"]["values"]
