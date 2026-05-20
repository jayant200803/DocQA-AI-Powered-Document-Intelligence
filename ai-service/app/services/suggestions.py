import httpx, json
from app.config.settings import get_settings

_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def _call_gemini(prompt: str, max_tokens: int = 256) -> str:
    settings = get_settings()
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": max_tokens,
            "thinkingConfig": {"thinkingBudget": 0},
        },
    }
    response = httpx.post(
        f"{_BASE}/{settings.llm_model}:generateContent",
        params={"key": settings.google_api_key},
        json=payload,
        timeout=30.0,
    )
    response.raise_for_status()
    parts = response.json()["candidates"][0]["content"]["parts"]
    return "".join(p["text"] for p in parts if "text" in p and not p.get("thought"))


def generate_suggestions(question: str, answer: str) -> list[str]:
    """Generate 3 follow-up questions from a Q&A exchange."""
    prompt = (
        "Based on this Q&A exchange, generate exactly 3 concise follow-up questions "
        "that a user would want to ask next about the SAME document content. "
        "The questions must be directly answerable from the document — do NOT ask meta questions about searching. "
        "Return ONLY a JSON array of 3 short question strings, no other text.\n\n"
        f"Question: {question}\n\nAnswer: {answer[:1500]}"
    )
    text = _call_gemini(prompt, max_tokens=256).strip()
    start, end = text.find("["), text.rfind("]") + 1
    if start >= 0 and end > start:
        try:
            result = json.loads(text[start:end])
            return [str(s) for s in result[:3]]
        except json.JSONDecodeError:
            pass
    return []


def generate_document_summary(file_name: str, text: str) -> str:
    """Generate a 1-2 sentence summary of a document."""
    prompt = (
        f"Write a 1-2 sentence summary of this document titled '{file_name}'. "
        f"Be concise and informative. Return only the summary text.\n\n"
        f"{text[:3000]}"
    )
    return _call_gemini(prompt, max_tokens=150).strip()
