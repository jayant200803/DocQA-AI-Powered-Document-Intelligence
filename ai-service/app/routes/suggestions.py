from pydantic import BaseModel
from fastapi import APIRouter
from app.services.suggestions import generate_suggestions

router = APIRouter()


class SuggestionsRequest(BaseModel):
    question: str
    answer: str


@router.post("/suggestions")
async def get_suggestions(req: SuggestionsRequest):
    if not req.question.strip() or not req.answer.strip():
        return {"suggestions": []}
    try:
        suggestions = generate_suggestions(req.question, req.answer)
        return {"suggestions": suggestions}
    except Exception as e:
        print(f"Suggestions error (non-fatal): {e}")
        return {"suggestions": []}
