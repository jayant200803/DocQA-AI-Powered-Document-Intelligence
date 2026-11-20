"""Evaluation harness for the document Q&A pipeline.

Ingests a known sample document, then runs a fixed set of questions — half of
them deliberately unanswerable — through the real retrieve -> grade -> generate
path and scores three things:

  * retrieval hit-rate   — did the right passage get retrieved? (answerable only)
  * abstention accuracy  — does it answer when it should and refuse when it should?
  * faithfulness         — are the answers it gives actually backed by the context?

Run from the ai-service folder:  python eval/run_eval.py
Needs GOOGLE_API_KEY and PINECONE_API_KEY in .env (same as the app).
"""
import json
import sys
import time
import httpx
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config.settings import get_settings
from app.services.chunker import chunk_text
from app.services.embedder import generate_embeddings
from app.services.retriever import store_vectors, delete_document_vectors
from app.services.pipeline import resolve_context
from app.services.evaluator import is_context_sufficient
from app.services.generator import generate_answer
from app.utils.prompts import build_context_string, ABSTAIN_MESSAGE

HERE = Path(__file__).resolve().parent
DOC_ID = "eval-orbit-one"
_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def ingest_sample() -> int:
    """Put the sample document into Pinecone, exactly as a real upload would."""
    text = (HERE / "dataset" / "orbit_one.txt").read_text(encoding="utf-8")
    chunks = chunk_text(text)
    embeddings = generate_embeddings([c["chunkText"] for c in chunks])
    store_vectors(DOC_ID, "eval-user", "orbit_one.txt", chunks, embeddings)
    return len(chunks)


def judge_faithful(answer: str, chunks: list[dict]) -> bool:
    """LLM-as-judge: is every claim in the answer supported by the context?

    Retries on 429 with backoff, like the rest of the service, so a free-tier
    rate limit slows the run down instead of killing it.
    """
    settings = get_settings()
    prompt = (
        "You are a strict fact-checker. Decide if EVERY claim in the answer is "
        "supported by the context. Reply with ONLY one word: YES or NO.\n\n"
        f"Context:\n{build_context_string(chunks)}\n\nAnswer:\n{answer}"
    )
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.0, "maxOutputTokens": 4},
    }
    for attempt in range(3):
        response = httpx.post(
            f"{_BASE}/{settings.llm_model}:generateContent",
            params={"key": settings.google_api_key},
            json=payload,
            timeout=20.0,
        )
        if response.status_code == 429 and attempt < 2:
            time.sleep(min(5 * (2 ** attempt), 60))
            continue
        response.raise_for_status()
        parts = response.json()["candidates"][0]["content"]["parts"]
        verdict = "".join(p["text"] for p in parts if "text" in p).strip().upper()
        return verdict.startswith("YES")


def answer_question(question: str):
    """Run one question through the real pipeline. Returns (answer, chunks, abstained)."""
    chunks, _mode = resolve_context(question, [DOC_ID])
    if not chunks or not is_context_sufficient(question, chunks):
        return ABSTAIN_MESSAGE, chunks, True
    answer = generate_answer(question, chunks)
    abstained = "couldn't find" in answer.lower()
    return answer, chunks, abstained


def main():
    questions = json.loads((HERE / "dataset" / "questions.json").read_text(encoding="utf-8"))

    print("Ingesting sample document ...")
    n_chunks = ingest_sample()
    print(f"  stored {n_chunks} chunks\n")

    hits = answerable = 0
    abstain_correct = scored = skipped = 0
    faithful_yes = faithful_total = 0

    print(f"{'Q':<48} {'expected':<10} {'did':<10} {'ok':<4}")
    print("-" * 76)
    try:
        for q in questions:
            try:
                answer, chunks, abstained = answer_question(q["question"])
                if not abstained:
                    judged = judge_faithful(answer, chunks)
            except httpx.HTTPStatusError as e:
                # Free-tier quota exhausted mid-run: skip this question, keep the rest.
                if e.response.status_code == 429:
                    skipped += 1
                    print(f"{q['question'][:46]:<48} {'rate-limited — skipped':<24}")
                    time.sleep(20)  # let the per-minute window recover
                    continue
                raise

            scored += 1
            if q["answerable"]:
                answerable += 1
                if any(q["evidence"].lower() in c["chunkText"].lower() for c in chunks):
                    hits += 1
                correct = not abstained
                if correct:  # only judge answers it actually gave
                    faithful_total += 1
                    if judged:
                        faithful_yes += 1
            else:
                correct = abstained

            if correct:
                abstain_correct += 1

            expected = "answer" if q["answerable"] else "refuse"
            did = "refused" if abstained else "answered"
            print(f"{q['question'][:46]:<48} {expected:<10} {did:<10} {'YES' if correct else 'no':<4}")
            time.sleep(3)  # keep under the free-tier request-per-minute limit
    finally:
        delete_document_vectors(DOC_ID)  # leave Pinecone clean so the run is repeatable

    print("\n" + "=" * 40)
    print("SCORECARD" + (f"  ({skipped} skipped — rate limit)" if skipped else ""))
    print("=" * 40)
    print(f"Questions scored     : {scored}/{len(questions)}")
    print(f"Retrieval hit-rate   : {hits}/{answerable}  ({_pct(hits, answerable)})")
    print(f"Abstention accuracy  : {abstain_correct}/{scored}  ({_pct(abstain_correct, scored)})")
    print(f"Faithfulness         : {faithful_yes}/{faithful_total}  ({_pct(faithful_yes, faithful_total)})")


def _pct(n: int, d: int) -> str:
    return f"{100 * n / d:.0f}%" if d else "n/a"


if __name__ == "__main__":
    main()
