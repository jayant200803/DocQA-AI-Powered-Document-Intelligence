import { Router } from 'express';
import { askQuestion, getChatSessions, getChatSession, deleteChatSession } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/ask', authenticate, askQuestion);
router.get('/history', authenticate, getChatSessions);
router.get('/history/:sessionId', authenticate, getChatSession);
router.delete('/history/:sessionId', authenticate, deleteChatSession);

export default router;
