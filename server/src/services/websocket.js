import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { queryDocuments } from './aiService.js';
import ChatHistory from '../models/ChatHistory.js';

let wss;

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    // Authenticate via query param token
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Authentication required');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.userId;
      ws.isAlive = true;
    } catch {
      ws.close(4001, 'Invalid token');
      return;
    }

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await handleMessage(ws, message);
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', data: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      // Cleanup if needed
    });

    ws.send(JSON.stringify({ type: 'connected', data: 'WebSocket connected' }));
  });

  // Heartbeat to detect broken connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(interval));

  console.log('WebSocket server initialized on /ws');
};

async function handleMessage(ws, message) {
  const { type, question, documentIds, sessionId } = message;

  if (type !== 'ask') {
    ws.send(JSON.stringify({ type: 'error', data: `Unknown message type: ${type}` }));
    return;
  }

  if (!question || !documentIds?.length) {
    ws.send(JSON.stringify({ type: 'error', data: 'Question and documentIds are required' }));
    return;
  }

  const currentSessionId = sessionId || uuidv4();
  let fullAnswer = '';
  let sources = [];

  try {
    // Call AI service with streaming
    const response = await queryDocuments(question, documentIds, ws.userId);

    // Read the SSE stream
    const reader = response.body;
    let buffer = '';

    for await (const chunk of reader) {
      buffer += chunk.toString();

      // Process complete SSE lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const event = JSON.parse(jsonStr);

          switch (event.type) {
            case 'sources':
              sources = event.data;
              ws.send(JSON.stringify({ type: 'sources', data: sources, sessionId: currentSessionId }));
              break;

            case 'token':
              fullAnswer += event.data;
              ws.send(JSON.stringify({ type: 'token', data: event.data }));
              break;

            case 'done':
              ws.send(JSON.stringify({ type: 'done', sessionId: currentSessionId }));
              break;

            case 'error':
              ws.send(JSON.stringify({ type: 'error', data: event.data }));
              break;
          }
        } catch {
          // Skip malformed SSE lines
        }
      }
    }

    // Save to chat history
    await saveChatMessage(ws.userId, currentSessionId, question, fullAnswer, sources, documentIds);
  } catch (error) {
    console.error('Query error:', error);
    ws.send(JSON.stringify({ type: 'error', data: 'Failed to process query. Please try again.' }));
  }
}

async function saveChatMessage(userId, sessionId, question, answer, sources, documentIds) {
  if (!answer || !answer.trim()) return; // don't save if LLM returned empty
  try {
    let chat = await ChatHistory.findOne({ sessionId });

    const userMessage = { role: 'user', content: question, sources: [], timestamp: new Date() };
    const assistantMessage = {
      role: 'assistant',
      content: answer,
      sources: sources.map((s) => ({
        documentId: s.documentId,
        chunkText: s.chunkText,
        chunkIndex: s.chunkIndex,
        relevanceScore: s.relevanceScore,
        fileName: s.fileName,
      })),
      timestamp: new Date(),
    };

    if (chat) {
      chat.messages.push(userMessage, assistantMessage);
      // Update title from first question if still default
      if (chat.title === 'New Chat' && chat.messages.length <= 2) {
        chat.title = question.slice(0, 60) + (question.length > 60 ? '...' : '');
      }
      await chat.save();
    } else {
      await ChatHistory.create({
        userId,
        sessionId,
        title: question.slice(0, 60) + (question.length > 60 ? '...' : ''),
        messages: [userMessage, assistantMessage],
        documentIds,
      });
    }
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
}

export const getWss = () => wss;
