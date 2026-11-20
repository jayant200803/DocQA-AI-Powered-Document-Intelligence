import httpx
from app.config.settings import get_settings

_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def rewrite_query(question: str) -> str:
    """Rewrite a user question into a cleaner retrieval query.

    Users ask in conversational or vague language ("what about the pricing?");
    a direct, keyword-rich query retrieves better. Returns the original question
    on any error so retrieval is never blocked by this step.
    """
    settings = get_settings()
    prompt = (
        "Rewrite the user's question as a concise, keyword-rich search query for "
        "retrieving passages from their documents. Keep every specific term "
        "(names, numbers, dates). Return ONLY the rewritten query, nothing else.\n\n"
        f"Question: {question}"
    )
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.0, "maxOutputTokens": 64},
    }
    try:
        response = httpx.post(
            f"{_BASE}/{settings.llm_model}:generateContent",
            params={"key": settings.google_api_key},
            json=payload,
            timeout=15.0,
        )
        response.raise_for_status()
        parts = response.json()["candidates"][0]["content"]["parts"]
        text = "".join(p["text"] for p in parts if "text" in p).strip()
        return text or question
    except Exception:
        return question
