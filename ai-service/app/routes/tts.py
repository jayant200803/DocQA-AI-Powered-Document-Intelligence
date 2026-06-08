from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from app.services.tts import synthesize, VOICES

router = APIRouter()


class TTSRequest(BaseModel):
    text: str
    voice: str = "Kore"


@router.post("/tts")
async def text_to_speech(req: TTSRequest):
    """Convert text to speech using Gemini TTS. Returns a WAV file."""
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text is required")
    try:
        wav = await synthesize(req.text[:4000], req.voice)  # cap at 4000 chars
        return Response(
            content=wav,
            media_type="audio/wav",
            headers={"Content-Disposition": 'attachment; filename="answer.wav"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tts/voices")
async def list_voices():
    return {"voices": VOICES}
