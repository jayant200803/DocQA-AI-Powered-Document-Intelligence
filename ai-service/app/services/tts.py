import base64
import struct
import httpx
from app.config.settings import get_settings

_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
TTS_MODEL = "gemini-2.5-flash-preview-tts"

VOICES = ["Kore", "Aoede", "Puck", "Charon", "Fenrir"]


def _pcm_to_wav(pcm: bytes, sample_rate: int = 24000, channels: int = 1, bits: int = 16) -> bytes:
    """Wrap raw PCM bytes in a WAV container."""
    byte_rate = sample_rate * channels * bits // 8
    block_align = channels * bits // 8
    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        36 + len(pcm),
        b"WAVE",
        b"fmt ",
        16,
        1,            # PCM
        channels,
        sample_rate,
        byte_rate,
        block_align,
        bits,
        b"data",
        len(pcm),
    )
    return header + pcm


def synthesize(text: str, voice: str = "Kore") -> bytes:
    """
    Call Gemini TTS and return WAV bytes.
    Uses gemini-2.5-flash-preview-tts — free via AI Studio key.
    """
    if voice not in VOICES:
        voice = "Kore"

    settings = get_settings()

    payload = {
        "contents": [{"parts": [{"text": text}]}],
        "generationConfig": {
            "response_modalities": ["AUDIO"],
            "speech_config": {
                "voice_config": {
                    "prebuilt_voice_config": {"voice_name": voice}
                }
            },
        },
    }

    response = httpx.post(
        f"{_BASE}/{TTS_MODEL}:generateContent",
        params={"key": settings.google_api_key},
        json=payload,
        timeout=60.0,
    )
    response.raise_for_status()

    data = response.json()
    inline = data["candidates"][0]["content"]["parts"][0]["inlineData"]
    pcm = base64.b64decode(inline["data"])

    # Extract sample rate from mimeType e.g. "audio/pcm;rate=24000"
    mime = inline.get("mimeType", "audio/pcm;rate=24000")
    rate = 24000
    for part in mime.split(";"):
        if part.startswith("rate="):
            rate = int(part.split("=")[1])

    return _pcm_to_wav(pcm, sample_rate=rate)
