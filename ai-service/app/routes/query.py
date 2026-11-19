import json
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.retriever import retrieve_similar_chunks
from app.services.generator import generate_answer, generate_answer_stream
from app.services.evaluator import is_context_sufficient
from app.utils.prompts import ABSTAIN_MESSAGE
from app.config.settings import get_settings

router = APIRouter()


class QueryRequest(BaseModel):
    question: str
    document_ids: list[str]
    user_id: str
    stream: bool = True


@router.post("/query")
async def query_documents(request: QueryRequest):
    """
    Retrieve relevant chunks and generate an answer.
    Supports both streaming (SSE) and non-streaming responses.
    """
    settings = get_settings()

    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    if not request.document_ids:
        raise HTTPException(status_code=400, detail="At least one document ID is required")

    # 1. Retrieve similar chunks
    try:
        chunks = retrieve_similar_chunks(
            query=request.question,
            document_ids=request.document_ids,
            top_k=settings.top_k,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrieval failed: {str(e)}")

    # 2. Refuse to answer when the documents don't actually cover the question.
    #    Empty retrieval, or a grader that says the context isn't enough, both abstain.
    if not chunks or not is_context_sufficient(request.question, chunks):
        if request.stream:
            return StreamingResponse(
                _no_results_stream(),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
            )
        return {"answer": ABSTAIN_MESSAGE, "sources": []}

    # 3. Generate answer
    if request.stream:
        return StreamingResponse(
            _stream_response(request.question, chunks),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )
    else:
        try:
            answer = generate_answer(request.question, chunks)
            return {
                "answer": answer,
                "sources": chunks,
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


async def _no_results_stream():
    """SSE stream for when the documents can't answer the question."""
    yield f"data: {json.dumps({'type': 'sources', 'data': []})}\n\n"
    yield f"data: {json.dumps({'type': 'token', 'data': ABSTAIN_MESSAGE})}\n\n"
    yield f"data: {json.dumps({'type': 'done'})}\n\n"


async def _stream_response(question: str, chunks: list[dict]):
    """Generator for Server-Sent Events streaming."""
    # First, send the sources
    yield f"data: {json.dumps({'type': 'sources', 'data': chunks})}\n\n"

    # Then stream the answer tokens
    try:
        async for token in generate_answer_stream(question, chunks):
            yield f"data: {json.dumps({'type': 'token', 'data': token})}\n\n"
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            msg = "The AI service is rate limited. Please wait a moment and try again."
        else:
            msg = f"AI service error ({e.response.status_code}). Please try again."
        yield f"data: {json.dumps({'type': 'error', 'data': msg})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'data': str(e)})}\n\n"

    # Signal completion
    yield f"data: {json.dumps({'type': 'done'})}\n\n"
