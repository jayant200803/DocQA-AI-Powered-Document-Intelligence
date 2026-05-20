import os
import httpx
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from app.services.pdf_parser import extract_text
from app.services.chunker import chunk_text
from app.services.embedder import generate_embeddings
from app.services.retriever import store_vectors
from app.services.suggestions import generate_document_summary
from app.config.settings import get_settings

router = APIRouter()

PROGRESS_STEPS = [
    ("Parsing", 0),
    ("Chunking", 1),
    ("Embedding", 2),
    ("Storing", 3),
]


async def _send_progress(client: httpx.AsyncClient, callback_url: str, document_id: str, step: str, index: int):
    """Fire-and-forget progress update — non-fatal on failure."""
    try:
        await client.patch(
            f"{callback_url}/api/documents/{document_id}/progress",
            json={"step": step, "index": index},
            timeout=5.0,
        )
    except Exception:
        pass


async def _process_document(file_path: str, document_id: str, user_id: str, file_name: str, callback_url: str):
    """Background task: parse → chunk → embed → store → callback."""
    try:
        async with httpx.AsyncClient() as client:
            # 1. Parse
            await _send_progress(client, callback_url, document_id, "Parsing", 0)
            text = extract_text(file_path)

            # 2. Chunk
            await _send_progress(client, callback_url, document_id, "Chunking", 1)
            chunks = chunk_text(text)
            if not chunks:
                raise ValueError("No chunks generated from document")

            # 3. Embed
            await _send_progress(client, callback_url, document_id, "Embedding", 2)
            chunk_texts = [c["chunkText"] for c in chunks]
            embeddings = generate_embeddings(chunk_texts)

            # 4. Store
            await _send_progress(client, callback_url, document_id, "Storing", 3)
            store_vectors(document_id, user_id, file_name, chunks, embeddings)

            # 5. Generate summary (non-fatal)
            summary = None
            try:
                summary = generate_document_summary(file_name, text)
            except Exception as e:
                print(f"Summary generation failed (non-fatal): {e}")

            # 6. Final callback
            payload = {"status": "ready", "chunkCount": len(chunks)}
            if summary:
                payload["summary"] = summary
            await client.patch(
                f"{callback_url}/api/documents/{document_id}/status",
                json=payload,
                timeout=10.0,
            )

    except Exception as e:
        print(f"Error processing document {document_id}: {e}")
        try:
            async with httpx.AsyncClient() as client:
                await client.patch(
                    f"{callback_url}/api/documents/{document_id}/status",
                    json={"status": "failed", "error": str(e)},
                    timeout=10.0,
                )
        except Exception:
            print(f"Failed to send error callback for document {document_id}")

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


@router.post("/ingest")
async def ingest_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    document_id: str = Form(...),
    user_id: str = Form(...),
):
    """Receive a file upload, then process it in the background."""
    settings = get_settings()

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in (".pdf", ".txt", ".text", ".md"):
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    upload_dir = "/tmp/rag-uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{document_id}_{file.filename}")

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    background_tasks.add_task(
        _process_document,
        file_path=file_path,
        document_id=document_id,
        user_id=user_id,
        file_name=file.filename or "unknown",
        callback_url=settings.server_callback_url,
    )

    return {"message": "Document accepted for processing", "documentId": document_id}


@router.delete("/ingest/{document_id}")
async def delete_document_vectors(document_id: str):
    """Delete all Pinecone vectors for a document namespace."""
    from app.services.retriever import delete_document_vectors as _delete
    try:
        _delete(document_id)
        return {"message": f"Vectors deleted for document {document_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete vectors: {str(e)}")
