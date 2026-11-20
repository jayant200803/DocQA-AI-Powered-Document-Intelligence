import json
import logging
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.config.settings import get_settings
from app.services.retriever import load_full_context, retrieve_hybrid
from app.services.query_transform import rewrite_query
from app.services.reranker import rerank
from app.services.pipeline import resolve_context
from app.services.generator import generate_answer, generate_answer_stream
from app.services.evaluator import is_context_sufficient
from app.utils.prompts import ABSTAIN_MESSAGE

logger = logging.getLogger("docqa")
router = APIRouter()


class QueryRequest(BaseModel):
    question: str
    document_ids: list[str]
    user_id: str
    stream: bool = True


def _sse(obj: dict) -> str:
    return f"data: {json.dumps(obj)}\n\n"


def _stage(name: str, label: str) -> str:
    """A pipeline-stage event, so the UI can show the agent's steps live."""
    return _sse({"type": "stage", "data": {"name": name, "label": label}})


@router.post("/query")
async def query_documents(request: QueryRequest):
    """Answer a question. Streaming narrates each agentic step; non-streaming returns once."""
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    if not request.document_ids:
        raise HTTPException(status_code=400, detail="At least one document ID is required")

    if request.stream:
        return StreamingResponse(
            _agentic_stream(request.question, request.document_ids),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
        )

    # Non-streaming: same pipeline, no stage events.
    try:
        chunks, mode = resolve_context(request.question, request.document_ids)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrieval failed: {str(e)}")
    if not chunks or not is_context_sufficient(request.question, chunks):
        return {"answer": ABSTAIN_MESSAGE, "sources": [], "mode": mode}
    try:
        answer = generate_answer(request.question, chunks)
        return {"answer": answer, "sources": chunks, "mode": mode}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


async def _agentic_stream(question: str, document_ids: list[str]):
    """Run the pipeline, emitting a stage event before each step so the UI can
    show CAG vs RAG and the retrieve → rerank → grade → generate flow live."""
    settings = get_settings()
    try:
        yield _stage("route", "Routing the question")

        # Small documents load whole (CAG); larger ones take the RAG path.
        whole = load_full_context(document_ids, settings.cag_max_chunks)
        if whole is not None:
            mode, chunks = "cag", whole
            yield _stage("cag", "Loading the whole document (CAG)")
        else:
            mode = "rag"
            yield _stage("rewrite", "Rewriting the query")
            search_query = rewrite_query(question)
            yield _stage("retrieve", "Hybrid search — vector + keyword")
            chunks = retrieve_hybrid(search_query, document_ids, top_k=settings.top_k)
            yield _stage("rerank", "Reranking the passages")
            chunks = rerank(question, chunks, top_k=settings.top_k)

        yield _stage("grade", "Checking the answer is grounded")
        sufficient = bool(chunks) and is_context_sufficient(question, chunks)
        logger.info(
            "query docs=%d mode=%s chunks=%d decision=%s",
            len(document_ids), mode, len(chunks), "answer" if sufficient else "abstain",
        )

        if not sufficient:
            yield _sse({"type": "sources", "data": [], "mode": mode})
            yield _sse({"type": "token", "data": ABSTAIN_MESSAGE})
            yield _sse({"type": "done"})
            return

        yield _sse({"type": "sources", "data": chunks, "mode": mode})
        yield _stage("generate", "Generating the answer")
        try:
            async for token in generate_answer_stream(question, chunks):
                yield _sse({"type": "token", "data": token})
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                msg = "The AI service is rate limited. Please wait a moment and try again."
            else:
                msg = f"AI service error ({e.response.status_code}). Please try again."
            yield _sse({"type": "error", "data": msg})
        except Exception as e:
            yield _sse({"type": "error", "data": str(e)})

        yield _sse({"type": "done"})
    except Exception as e:
        yield _sse({"type": "error", "data": f"Query failed: {str(e)}"})
