import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Send a document file to the Python AI service for ingestion.
 */
export const ingestDocument = async (filePath, documentId, userId, fileName) => {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), fileName);
  form.append('document_id', documentId);
  form.append('user_id', userId);

  const response = await fetch(`${AI_SERVICE_URL}/ingest`, {
    method: 'POST',
    body: form,
    headers: form.getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `AI service returned ${response.status}`);
  }

  return response.json();
};

/**
 * Query documents via the AI service. Returns a readable stream (SSE) for streaming.
 */
export const queryDocuments = async (question, documentIds, userId, stream = true) => {
  const response = await fetch(`${AI_SERVICE_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      document_ids: documentIds,
      user_id: userId,
      stream,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `AI service returned ${response.status}`);
  }

  return response;
};

/**
 * Delete all Pinecone vectors for a document.
 */
export const deleteDocumentVectors = async (documentId) => {
  const response = await fetch(`${AI_SERVICE_URL}/ingest/${documentId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `AI service returned ${response.status}`);
  }

  return response.json();
};

/**
 * Check AI service health.
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};
