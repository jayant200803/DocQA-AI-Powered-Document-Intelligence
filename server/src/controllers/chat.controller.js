import { v4 as uuidv4 } from 'uuid';
import ChatHistory from '../models/ChatHistory.js';
import { queryDocuments } from '../services/aiService.js';

export const askQuestion = async (req, res) => {
  const { question, documentIds, sessionId } = req.body;

  if (!question?.trim()) {
    return res.status(400).json({ error: 'Question is required.' });
  }
  if (!documentIds?.length) {
    return res.status(400).json({ error: 'At least one documentId is required.' });
  }

  const currentSessionId = sessionId || uuidv4();

  try {
    const aiResponse = await queryDocuments(question, documentIds, req.user.userId, false);
    const data = await aiResponse.json();

    // Persist to chat history
    const userMessage = { role: 'user', content: question, sources: [], timestamp: new Date() };
    const assistantMessage = {
      role: 'assistant',
      content: data.answer,
      sources: (data.sources || []).map((s) => ({
        documentId: s.documentId,
        chunkText: s.chunkText,
        chunkIndex: s.chunkIndex,
        relevanceScore: s.relevanceScore,
        fileName: s.fileName,
      })),
      timestamp: new Date(),
    };

    let chat = await ChatHistory.findOne({ sessionId: currentSessionId });
    if (chat) {
      chat.messages.push(userMessage, assistantMessage);
      await chat.save();
    } else {
      await ChatHistory.create({
        userId: req.user.userId,
        sessionId: currentSessionId,
        title: question.slice(0, 60) + (question.length > 60 ? '...' : ''),
        messages: [userMessage, assistantMessage],
        documentIds,
      });
    }

    res.json({
      sessionId: currentSessionId,
      answer: data.answer,
      sources: data.sources || [],
    });
  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({ error: 'Failed to process query.' });
  }
};

export const getChatSessions = async (req, res) => {
  try {
    const sessions = await ChatHistory.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 })
      .select('sessionId title documentIds createdAt updatedAt')
      .limit(50);

    res.json({ sessions });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history.' });
  }
};

export const getChatSession = async (req, res) => {
  try {
    const chat = await ChatHistory.findOne({
      sessionId: req.params.sessionId,
      userId: req.user.userId,
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    res.json({ chat });
  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({ error: 'Failed to fetch chat session.' });
  }
};

export const deleteChatSession = async (req, res) => {
  try {
    const result = await ChatHistory.deleteOne({
      sessionId: req.params.sessionId,
      userId: req.user.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    res.json({ message: 'Chat session deleted.' });
  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({ error: 'Failed to delete chat session.' });
  }
};
