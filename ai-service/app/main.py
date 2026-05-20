from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import ingest, query, tts, suggestions

app = FastAPI(
    title="RAG Document QA — AI Service",
    description="AI microservice for document ingestion and question answering",
    version="1.0.0",
)

# CORS — only backend server should call this in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(ingest.router, tags=["Ingestion"])
app.include_router(query.router, tags=["Query"])
app.include_router(tts.router, tags=["TTS"])
app.include_router(suggestions.router, tags=["Suggestions"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-service"}
