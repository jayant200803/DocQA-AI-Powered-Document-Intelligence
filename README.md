<div align="center">

# DocQA — AI-Powered Document Intelligence

### Upload any document. Ask anything. Get cited, sourced answers — instantly.

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Pinecone](https://img.shields.io/badge/Pinecone-000000?style=for-the-badge&logo=pinecone&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-4c6ef5?style=for-the-badge&logo=render&logoColor=white)](https://docqa-ai-powered-document-intelligence-3.onrender.com)
![Status](https://img.shields.io/badge/Status-Live%20on%20Render-22c55e?style=for-the-badge)

</div>

---

## Live Demo

> The app is fully deployed and live. Click below to try it — no setup required.

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | [docqa-ai-powered-document-intelligence-3.onrender.com](https://docqa-ai-powered-document-intelligence-3.onrender.com) | Live |
| **Backend API** | [docqa-ai-powered-document-intelligence-2.onrender.com](https://docqa-ai-powered-document-intelligence-2.onrender.com) | Live |
| **AI Service** | [docqa-ai-powered-document-intelligence.onrender.com](https://docqa-ai-powered-document-intelligence.onrender.com) | Live |

> **Note:** Deployed on Render free tier — the first load after inactivity may take ~30 seconds to wake up. Subsequent requests are instant.

---

## What Is This?

DocQA is a full-stack AI platform that lets you have a real conversation with your documents.

You upload a PDF, a research paper, a contract, a manual — anything. The system reads it, understands it, and stores the knowledge in a vector database. From that moment on, you can ask it questions in plain English and it will respond with accurate, cited answers pulled directly from your document — not hallucinated, not generic, but grounded in your actual content.

It works like having a brilliant research assistant who has read every document you've ever uploaded and can instantly recall the right passage to answer your question.

---

## What Can It Do?

- **Upload & Chat** — Drop in a PDF or text file and start asking questions immediately
- **Cited Answers** — Every response points back to the exact source chunk it used, so you can verify
- **Streaming Responses** — Answers appear token by token, just like ChatGPT, so you never wait for a wall of text
- **AI Follow-up Suggestions** — After each answer, the AI suggests 3 smart follow-up questions based on what you just learned
- **Copy & Regenerate** — Copy any answer to clipboard or regenerate it if you want a different take
- **Text-to-Speech** — Listen to answers read aloud in 5 different Gemini AI voices
- **Document Auto-Summary** — Every uploaded document gets a 1-2 sentence AI summary so you know what's in it at a glance
- **Live Processing Progress** — Watch your document go through Parse → Chunk → Embed → Store in real time
- **Multi-Document Chat** — Select multiple documents at once and ask questions that span all of them
- **Chat History** — All your conversations are saved and searchable; pick up where you left off
- **Secure Auth** — JWT-based login with access + refresh tokens, every user's data is isolated

---

## How It Works — The Full Story

### Step 1: You Upload a Document

You drag a PDF (or .txt / .md) into the upload zone. The file goes to the Node.js backend, which saves it and immediately hands it off to the Python AI service for processing. You'll see a live progress bar in the UI as it moves through each stage.

### Step 2: The AI Service Processes It

This is where the magic happens. The document goes through a 4-stage pipeline:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENT PROCESSING PIPELINE                  │
│                                                                   │
│  📄 Raw File                                                      │
│      │                                                            │
│      ▼                                                            │
│  ① PARSE ──── Extract all text from the PDF (page by page)       │
│      │                                                            │
│      ▼                                                            │
│  ② CHUNK ──── Split text into ~500-word overlapping segments     │
│      │         (overlap ensures no idea gets cut in half)        │
│      │                                                            │
│      ▼                                                            │
│  ③ EMBED ──── Convert each chunk into a vector (768 numbers)     │
│      │         using Google's gemini-embedding-001 model         │
│      │         Each vector mathematically represents meaning     │
│      │                                                            │
│      ▼                                                            │
│  ④ STORE ──── Save all vectors to Pinecone with metadata         │
│               (which file, which chunk, which user)              │
│                                                                   │
│  ✅ Done! The document is now searchable by meaning, not keyword │
└─────────────────────────────────────────────────────────────────┘
```

After storing, Gemini AI reads the first part of the document and writes a short summary automatically.

### Step 3: You Ask a Question

You type a question in the chat. Here is exactly what happens in the next few hundred milliseconds:

```
┌─────────────────────────────────────────────────────────────────┐
│                        QUERY PIPELINE                            │
│                                                                   │
│  ❓ "What are the payment terms in Section 4?"                    │
│      │                                                            │
│      ▼                                                            │
│  EMBED QUESTION ── Turn your question into a vector              │
│      │              (same embedding model used for chunks)       │
│      │                                                            │
│      ▼                                                            │
│  VECTOR SEARCH ─── Search Pinecone for the top-K chunks         │
│      │              whose vectors are closest to your question   │
│      │              This is semantic search, not keyword search  │
│      │                                                            │
│      ▼                                                            │
│  BUILD CONTEXT ─── Assemble the retrieved chunks into a         │
│      │              structured prompt with [Source N] labels     │
│      │                                                            │
│      ▼                                                            │
│  ASK GEMINI ────── Send context + question to Gemini 2.5 Flash  │
│      │              The LLM only sees your documents, not the    │
│      │              whole internet — so answers stay grounded    │
│      │                                                            │
│      ▼                                                            │
│  STREAM TOKENS ─── Answer arrives word by word via SSE          │
│                     Sources are shown as clickable references    │
└─────────────────────────────────────────────────────────────────┘
```

### Step 4: The AI Suggests What to Ask Next

Once the answer is complete, a separate Gemini call analyzes the Q&A exchange and generates 3 follow-up questions that are directly answerable from the same document. These appear as clickable chips below the answer.

---

## System Design — How the Three Services Talk

```
┌──────────────────────────────────────────────────────────────────────┐
│                          SYSTEM ARCHITECTURE                          │
│                                                                        │
│   ┌─────────────────┐         ┌──────────────────┐                   │
│   │   React Client   │ ◄─────► │  Node.js Backend │                  │
│   │   (Port 5173)    │  HTTP/  │   (Port 5000)    │                  │
│   │                  │  WS     │                  │                  │
│   │  • Chat UI       │         │  • JWT Auth       │                  │
│   │  • Doc Manager   │         │  • File Upload    │                  │
│   │  • SSE Streaming │         │  • Session Mgmt   │                  │
│   │  • TTS Player    │         │  • Progress PATCH │                  │
│   └─────────────────┘         └────────┬─────────┘                  │
│                                         │                              │
│                                   HTTP (internal)                      │
│                                         │                              │
│                                         ▼                              │
│                               ┌──────────────────┐                   │
│                               │  Python AI Service│                   │
│                               │   (Port 8000)     │                   │
│                               │                   │                   │
│                               │  • PDF Parsing    │                   │
│                               │  • Text Chunking  │                   │
│                               │  • Embeddings     │                   │
│                               │  • RAG Pipeline   │                   │
│                               │  • Suggestions    │                   │
│                               │  • Summarization  │                   │
│                               └────────┬──────────┘                  │
│                                         │                              │
│                    ┌────────────────────┼────────────────┐            │
│                    ▼                    ▼                 ▼            │
│           ┌──────────────┐   ┌───────────────┐  ┌──────────────┐    │
│           │ MongoDB Atlas │   │   Pinecone    │  │ Google Gemini│    │
│           │               │   │  Vector DB    │  │     API      │    │
│           │  • Users      │   │               │  │              │    │
│           │  • Documents  │   │  • Embeddings │  │ • Flash 2.5  │    │
│           │  • Sessions   │   │  • Namespaced │  │ • Embeddings │    │
│           │  • Messages   │   │    per user   │  │ • TTS voices │    │
│           └──────────────┘   └───────────────┘  └──────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

### Why Three Separate Services?

**Node.js handles everything user-facing** — authentication, file uploads, chat sessions, and serving the React app. It's great at I/O-heavy tasks and real-time communication.

**Python handles all AI work** — parsing PDFs, running embedding models, managing the RAG pipeline. Python has the best AI/ML ecosystem and keeps the heavy computation isolated.

**The React client** is a pure UI layer — it talks to Node.js for everything and renders the streaming responses in real time.

This separation means you can scale each part independently, swap out the LLM without touching the frontend, or replace the vector DB without touching auth.

---

## Tech Stack

| What | Technology | Why |
|------|-----------|-----|
| **Frontend** | React 18 + TypeScript + Tailwind CSS | Type-safe UI with utility-first styling |
| **Build Tool** | Vite | Instant hot reload, fast builds |
| **Backend** | Node.js + Express | Fast I/O, great WebSocket support |
| **AI Service** | Python + FastAPI | Best AI/ML ecosystem, async by default |
| **LLM** | Google Gemini 2.5 Flash | Fast, cheap, excellent instruction following |
| **Embeddings** | gemini-embedding-001 (768-dim) | Semantic search quality |
| **Text-to-Speech** | Gemini TTS (5 voices) | Native AI voices, PCM→WAV conversion |
| **Vector Database** | Pinecone | Managed, scalable, millisecond vector search |
| **Database** | MongoDB Atlas | Flexible schema for docs + messages |
| **Auth** | JWT (access + refresh tokens) | Stateless, secure, per-user data isolation |
| **Streaming** | Server-Sent Events (SSE) | Real-time token streaming to browser |

---

## Getting Started

### What You Need

- **Node.js** 18 or newer
- **Python** 3.10 or newer
- **MongoDB Atlas** account — free tier works perfectly
- **Pinecone** account — free tier works perfectly
- **Google AI Studio** API key — free tier includes Gemini Flash

### Environment Setup

Create a `.env` file in `server/`:
```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_long_random_string
JWT_REFRESH_SECRET=another_long_random_string
AI_SERVICE_URL=http://localhost:8000
PORT=5000
```

Create a `.env` file in `ai-service/`:
```
GOOGLE_API_KEY=your_google_ai_studio_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_index_name
LLM_MODEL=gemini-2.5-flash
EMBEDDING_MODEL=gemini-embedding-001
```

### Run It

Open three terminals:

**Terminal 1 — AI Service (Python):**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Backend (Node.js):**
```bash
cd server
npm install
npm run dev
```

**Terminal 3 — Frontend (React):**
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), create an account, and start uploading documents.

---

## Project Structure

```
rag-doc-qa/
│
├── client/                    # React + TypeScript frontend
│   └── src/
│       ├── components/
│       │   ├── Auth/          # Login & Register pages
│       │   ├── Chat/          # ChatWindow, MessageBubble, ChatInput
│       │   ├── Documents/     # DocumentCard, UploadZone
│       │   └── Layout/        # Header, Sidebar
│       ├── services/          # API client (axios)
│       └── types.ts           # Shared TypeScript interfaces
│
├── server/                    # Node.js + Express backend
│   └── src/
│       ├── controllers/       # Auth, Document, Chat logic
│       ├── models/            # Mongoose schemas
│       ├── routes/            # Express route definitions
│       └── middleware/        # JWT auth middleware
│
└── ai-service/                # Python + FastAPI AI engine
    └── app/
        ├── routes/            # /ingest, /query, /suggestions, /tts
        ├── services/          # retriever, generator, suggestions
        ├── utils/             # Prompts, chunking, PDF parsing
        └── config/            # Settings (pydantic)
```

---

## The RAG Concept — Plain English

**RAG stands for Retrieval-Augmented Generation.** Here is the idea without any jargon:

Normal LLMs are trained on the internet. They know a lot but they don't know your specific documents. And they sometimes make things up.

RAG fixes both problems. Before asking the LLM anything, you first *retrieve* the most relevant passages from your documents using vector search. Then you hand those passages directly to the LLM as context and say "answer only based on this." The LLM is now grounded — it can only talk about what's in your documents.

The "vector" part is how retrieval works. Instead of searching for exact keywords, we convert both the document chunks and your question into high-dimensional number arrays (vectors) that capture meaning. Similar meanings end up close together in this mathematical space. So a question about "payment terms" will find a chunk about "invoicing conditions" even if the exact words don't match.

This is why DocQA can answer nuanced questions that a simple `Ctrl+F` would miss entirely.

---

<div align="center">

Built with Google Gemini · Pinecone · MongoDB Atlas · React · FastAPI

**Deployed on [Render](https://render.com)**

[Try it live →](https://docqa-ai-powered-document-intelligence-3.onrender.com)

</div>
