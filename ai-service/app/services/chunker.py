from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config.settings import get_settings


def chunk_text(text: str) -> list[dict]:
    """
    Split text into overlapping chunks using LangChain's RecursiveCharacterTextSplitter.

    Returns a list of dicts: [{ "chunkIndex": int, "chunkText": str }]
    """
    settings = get_settings()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    documents = splitter.create_documents([text])

    chunks = []
    for i, doc in enumerate(documents):
        chunks.append({
            "chunkIndex": i,
            "chunkText": doc.page_content,
        })

    return chunks
