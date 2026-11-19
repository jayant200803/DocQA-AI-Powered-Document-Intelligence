from pinecone import Pinecone
from app.config.settings import get_settings
from app.services.embedder import generate_single_embedding
from app.services.rank import bm25_scores, reciprocal_rank_fusion

_index = None


def _get_index():
    global _index
    if _index is None:
        settings = get_settings()
        pc = Pinecone(api_key=settings.pinecone_api_key)
        _index = pc.Index(settings.pinecone_index)
    return _index


def store_vectors(document_id: str, user_id: str, file_name: str, chunks: list[dict], embeddings: list[list[float]]):
    """
    Store chunk embeddings in Pinecone.
    Uses documentId as namespace for isolation.
    """
    index = _get_index()

    vectors = []
    for chunk, embedding in zip(chunks, embeddings):
        vector_id = f"doc_{document_id}_chunk_{chunk['chunkIndex']}"
        vectors.append({
            "id": vector_id,
            "values": embedding,
            "metadata": {
                "documentId": document_id,
                "userId": user_id,
                "chunkIndex": chunk["chunkIndex"],
                "chunkText": chunk["chunkText"][:1000],  # Pinecone metadata limit
                "fileName": file_name,
            },
        })

    # Upsert in batches of 100
    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i : i + batch_size]
        index.upsert(vectors=batch, namespace=document_id)


def retrieve_similar_chunks(query: str, document_ids: list[str], top_k: int = 5) -> list[dict]:
    """
    Find the most similar chunks across specified documents.
    Queries each document namespace and merges results.
    """
    settings = get_settings()
    index = _get_index()

    query_embedding = generate_single_embedding(query)

    all_results = []

    for doc_id in document_ids:
        try:
            response = index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                namespace=doc_id,
            )

            for match in response.matches:
                all_results.append({
                    "documentId": match.metadata.get("documentId", ""),
                    "fileName": match.metadata.get("fileName", "Unknown"),
                    "chunkText": match.metadata.get("chunkText", ""),
                    "chunkIndex": match.metadata.get("chunkIndex", 0),
                    "relevanceScore": round(float(match.score), 4),
                })
        except Exception as e:
            print(f"Error querying namespace {doc_id}: {e}")

    # Sort by relevance and return top_k
    all_results.sort(key=lambda x: x["relevanceScore"], reverse=True)
    return all_results[:top_k]


def retrieve_hybrid(query: str, document_ids: list[str], top_k: int = 5, pool: int = 20) -> list[dict]:
    """Retrieve with vector search + BM25, fused by reciprocal rank.

    Pulls a larger candidate pool by vector similarity, then re-ranks it by
    blending the vector order with a BM25 keyword order. Catches exact terms
    pure vector search would miss, without a second index.
    """
    candidates = retrieve_similar_chunks(query, document_ids, top_k=pool)
    if len(candidates) <= top_k:
        return candidates[:top_k]

    vector_ranking = list(range(len(candidates)))  # already sorted by vector score
    bm25 = bm25_scores(query, [c["chunkText"] for c in candidates])
    bm25_ranking = sorted(range(len(candidates)), key=lambda i: bm25[i], reverse=True)

    fused = reciprocal_rank_fusion([vector_ranking, bm25_ranking])
    return [candidates[i] for i in fused[:top_k]]


def delete_document_vectors(document_id: str):
    """Delete all vectors for a document (by namespace)."""
    index = _get_index()
    try:
        index.delete(delete_all=True, namespace=document_id)
    except Exception as e:
        print(f"Error deleting vectors for document {document_id}: {e}")
