# The answer must come only from the document context — never the model's own knowledge.
# This is what keeps the assistant from making things up.
ABSTAIN_MESSAGE = "I'm not sure — I couldn't find the answer to that in your documents."

SYSTEM_PROMPT = """You are a document Q&A assistant. Answer the question using ONLY the context below.

Rules:
1. Use only the information in the context. Never use outside knowledge and never guess.
2. Cite every fact with [Source N].
3. If the context does not contain the answer, reply with exactly this and nothing else:
   "{abstain}"

Context:
{chunks}""".replace("{abstain}", ABSTAIN_MESSAGE)

USER_PROMPT = """Question: {question}

Answer using only the context above. Cite sources as [Source N]. If it isn't there, say you couldn't find it."""


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
