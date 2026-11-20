"""The retrieval pipeline: decide how to gather context for a question.

Small documents take the CAG path (load the whole thing); larger ones take the
agentic RAG path (rewrite -> hybrid search -> rerank). Kept here so the query
route and the evaluation harness run the exact same logic.
"""
from app.config.settings import get_settings
from app.services.retriever import load_full_context, retrieve_hybrid
from app.services.query_transform import rewrite_query
from app.services.reranker import rerank


def resolve_context(question: str, document_ids: list[str]) -> tuple[list[dict], str]:
    """Return (chunks, mode) where mode is 'cag' or 'rag'."""
    settings = get_settings()

    whole = load_full_context(document_ids, settings.cag_max_chunks)
    if whole is not None:
        return whole, "cag"

    search_query = rewrite_query(question)
    chunks = retrieve_hybrid(search_query, document_ids, top_k=settings.top_k)
    chunks = rerank(question, chunks, top_k=settings.top_k)
    return chunks, "rag"
