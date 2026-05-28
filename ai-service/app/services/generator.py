import httpx
import json
from collections.abc import AsyncGenerator
from app.config.settings import get_settings
from app.utils.prompts import build_messages

_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def _build_prompt(question: str, chunks: list[dict]) -> str:
    """Convert message list to a single prompt string."""
    messages = build_messages(question, chunks)
    parts = []
    for msg in messages:
        if msg["role"] == "system":
            parts.append(msg["content"])
        elif msg["role"] == "user":
            parts.append(f"\n{msg['content']}")
    return "\n\n".join(parts)


def _make_body(prompt: str, settings) -> dict:
    return {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": settings.llm_temperature,
            "maxOutputTokens": settings.llm_max_tokens,
            "thinkingConfig": {"thinkingBudget": 0},  # disable thinking for speed
        },
    }


def generate_answer(question: str, chunks: list[dict]) -> str:
    """Generate a non-streaming answer using Gemini via REST API."""
    settings = get_settings()
    response = httpx.post(
        f"{_BASE}/{settings.llm_model}:generateContent",
        params={"key": settings.google_api_key},
        json=_make_body(_build_prompt(question, chunks), settings),
        timeout=60.0,
    )
    response.raise_for_status()
    data = response.json()
    parts = data["candidates"][0]["content"]["parts"]
    return "".join(p["text"] for p in parts if "text" in p and not p.get("thought"))


async def generate_answer_stream(question: str, chunks: list[dict]) -> AsyncGenerator[str, None]:
    """Stream answer tokens one at a time using Gemini SSE."""
    settings = get_settings()
    async with httpx.AsyncClient() as client:
        async with client.stream(
            "POST",
            f"{_BASE}/{settings.llm_model}:streamGenerateContent",
            params={"key": settings.google_api_key, "alt": "sse"},
            json=_make_body(_build_prompt(question, chunks), settings),
            timeout=120.0,
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue
                data_str = line[6:].strip()
                if not data_str or data_str == "[DONE]":
                    continue
                try:
                    data = json.loads(data_str)
                    for candidate in data.get("candidates", []):
                        for part in candidate.get("content", {}).get("parts", []):
                            if "text" in part and not part.get("thought"):
                                yield part["text"]
                except json.JSONDecodeError:
                    pass
