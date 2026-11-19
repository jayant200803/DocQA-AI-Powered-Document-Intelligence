"""Keyword ranking (BM25) and rank fusion (RRF).

Vector search alone misses exact terms — names, IDs, codes — that don't sit
close in embedding space. BM25 catches those by scoring literal word overlap,
and reciprocal rank fusion blends the two rankings into one. Both are small,
dependency-free, and run over the already-retrieved candidate pool, so they add
no memory cost on a free-tier box.
"""
import math
import re
from collections import Counter

_WORD = re.compile(r"[a-z0-9]+")


def _tokenize(text: str) -> list[str]:
    return _WORD.findall(text.lower())


def bm25_scores(query: str, documents: list[str], k1: float = 1.5, b: float = 0.75) -> list[float]:
    """Score each document against the query with Okapi BM25.

    IDF is computed over the given documents (the candidate pool), so this is
    meant for reranking a shortlist, not searching a whole corpus.
    """
    docs = [_tokenize(d) for d in documents]
    if not docs:
        return []
    n = len(docs)
    avg_len = sum(len(d) for d in docs) / n
    # Document frequency of each term across the pool.
    df: Counter[str] = Counter()
    for d in docs:
        df.update(set(d))
    q_terms = set(_tokenize(query))

    scores = []
    for d in docs:
        freq = Counter(d)
        score = 0.0
        for term in q_terms:
            if term not in freq:
                continue
            idf = math.log(1 + (n - df[term] + 0.5) / (df[term] + 0.5))
            tf = freq[term]
            score += idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * len(d) / avg_len))
        scores.append(score)
    return scores


def reciprocal_rank_fusion(rankings: list[list[int]], k: int = 60) -> list[int]:
    """Fuse several rankings (each a list of item indices, best first) into one.

    Returns item indices ordered by summed RRF score. k dampens the weight of
    low ranks; 60 is the value from the original RRF paper.
    """
    scores: dict[int, float] = {}
    for ranking in rankings:
        for rank, item in enumerate(ranking):
            scores[item] = scores.get(item, 0.0) + 1.0 / (k + rank)
    return sorted(scores, key=lambda i: scores[i], reverse=True)
