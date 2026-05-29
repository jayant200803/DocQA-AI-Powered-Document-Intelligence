import httpx
import json
import asyncio
import time
from collections.abc import AsyncGenerator
from app.config.settings import get_settings
from app.utils.prompts import build_messages

_MAX_RETRIES = 3


def _retry_wait(attempt: int, headers: dict) -> float:
    """Return seconds to wait before the next retry (respects Retry-After header)."""
    retry_after = headers.get("retry-after") or headers.get("Retry-After")
    if retry_after:
        try:
            return float(retry_after)
        except ValueError:
            pass
    return min(5 * (2 ** attempt), 60)  # 5s, 10s, 20s … capped at 60s

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
    for attempt in range(_MAX_RETRIES):
        response = httpx.post(
            f"{_BASE}/{settings.llm_model}:generateContent",
            params={"key": settings.google_api_key},
            json=_make_body(_build_prompt(question, chunks), settings),
            timeout=60.0,
        )
        if response.status_code == 429 and attempt < _MAX_RETRIES - 1:
            time.sleep(_retry_wait(attempt, dict(response.headers)))
            continue
        response.raise_for_status()
        data = response.json()
        parts = data["candidates"][0]["content"]["parts"]
        return "".join(p["text"] for p in parts if "text" in p and not p.get("thought"))
    raise RuntimeError("Gemini rate limit exceeded after retries")


async def generate_answer_stream(question: str, chunks: list[dict]) -> AsyncGenerator[str, None]:
    """Stream answer tokens one at a time using Gemini SSE, with 429 retry."""
    settings = get_settings()
    for attempt in range(_MAX_RETRIES):
        try:
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    f"{_BASE}/{settings.llm_model}:streamGenerateContent",
                    params={"key": settings.google_api_key, "alt": "sse"},
                    json=_make_body(_build_prompt(question, chunks), settings),
                    timeout=120.0,
                ) as response:
                    if response.status_code == 429 and attempt < _MAX_RETRIES - 1:
                        wait = _retry_wait(attempt, dict(response.headers))
                        await asyncio.sleep(wait)
                        continue
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
            return  # success — exit retry loop
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429 and attempt < _MAX_RETRIES - 1:
                await asyncio.sleep(_retry_wait(attempt, dict(e.response.headers)))
            else:
                raise
