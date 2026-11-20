import httpx
import time
from app.config.settings import get_settings
from app.utils.prompts import build_context_string

_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
_MAX_RETRIES = 3


def is_context_sufficient(question: str, chunks: list[dict]) -> bool:
    """Ask Gemini whether the retrieved chunks actually contain the answer.

    Returns False when they don't, so the query route can refuse instead of
    letting the model guess. On any grader error we return True and let the
    strict prompt be the second line of defence — a grader hiccup should not
    block a question the documents can genuinely answer.
    """
    settings = get_settings()
    prompt = (
        "You are a strict grader. Decide whether the context below contains enough "
        "information to answer the question. Reply with ONLY one word: YES or NO.\n\n"
        f"Question: {question}\n\nContext:\n{build_context_string(chunks)}"
    )
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.0,
            "maxOutputTokens": 4,
        },
    }
    try:
        for attempt in range(_MAX_RETRIES):
            response = httpx.post(
                f"{_BASE}/{settings.llm_model}:generateContent",
                params={"key": settings.google_api_key},
                json=payload,
                timeout=20.0,
            )
            if response.status_code == 429 and attempt < _MAX_RETRIES - 1:
                time.sleep(min(5 * (2 ** attempt), 60))
                continue
            response.raise_for_status()
            parts = response.json()["candidates"][0]["content"]["parts"]
            verdict = "".join(p["text"] for p in parts if "text" in p).strip().upper()
            return verdict.startswith("YES")
    except Exception:
        return True
