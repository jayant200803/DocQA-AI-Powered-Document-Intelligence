SYSTEM_PROMPT = """You are a helpful document Q&A assistant. Answer the user's question using the provided document context.

Guidelines:
1. Base your answer on the context chunks provided below.
2. Cite your sources using [Source N] notation when referencing specific information.
3. If the context contains relevant information, provide a clear and thorough answer with citations.
4. If the context is only partially relevant, share what you found and note what is missing.
5. Only say you could not find the information if the context genuinely contains nothing relevant.
6. Do not fabricate facts, but you may use your general knowledge to provide helpful context alongside the document content.

Context:
{chunks}"""

USER_PROMPT = """Question: {question}

Answer based on the context above. Cite sources using [Source N] format."""


def build_context_string(chunks: list[dict]) -> str:
    """Build formatted context string from retrieved chunks."""
    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        filename = chunk.get("fileName", "Unknown")
        text = chunk.get("chunkText", "")
        context_parts.append(f"[Source {i}] (from: {filename})\n{text}")
    return "\n\n".join(context_parts)


def build_messages(question: str, chunks: list[dict]) -> list[dict]:
    """Build the full message list for the Gemini API call."""
    context_string = build_context_string(chunks)
    system_content = SYSTEM_PROMPT.replace("{chunks}", context_string)

    return [
        {"role": "system", "content": system_content},
        {"role": "user", "content": USER_PROMPT.replace("{question}", question)},
    ]
