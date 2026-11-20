import httpx
import json
from app.config.settings import get_settings
from app.utils.prompts import build_context_string

_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def rerank(question: str, chunks: list[dict], top_k: int = 5) -> list[dict]:
    """Ask Gemini which retrieved chunks actually answer the question.

    Embedding similarity ranks by topic, not by whether a chunk holds the answer.
    This second pass reorders the chunks and drops the irrelevant ones, which
    both sharpens the answer and helps the grader abstain on weak context.
    Returns the chunks unchanged on any error.
    """
    if len(chunks) <= 1:
        return chunks
    settings = get_settings()
    prompt = (
        "Rank the sources below by how well each one answers the question. "
        "Return ONLY a JSON array of source numbers (most relevant first), "
        "including only sources that genuinely help. Example: [3, 1, 4]\n\n"
        f"Question: {question}\n\n{build_context_string(chunks)}"
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
            timeout=20.0,
        )
        response.raise_for_status()
        parts = response.json()["candidates"][0]["content"]["parts"]
        text = "".join(p["text"] for p in parts if "text" in p)
        start, end = text.find("["), text.rfind("]") + 1
        order = json.loads(text[start:end]) if start >= 0 and end > start else []
        # Source numbers are 1-based; keep valid, in-range picks only.
        picked = [chunks[i - 1] for i in order if isinstance(i, int) and 1 <= i <= len(chunks)]
        return picked[:top_k] if picked else chunks[:top_k]
    except Exception:
        return chunks[:top_k]
