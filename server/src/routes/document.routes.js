import { Router } from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  updateDocumentStatus,
  updateDocumentProgress,
} from '../controllers/document.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// User-facing routes (require auth)
router.post('/upload', authenticate, uploadLimiter, upload.single('file'), uploadDocument);
router.get('/', authenticate, getDocuments);
router.get('/:id', authenticate, getDocument);
router.delete('/:id', authenticate, deleteDocument);

// Internal callbacks from AI service (no auth — should be behind firewall in production)
router.patch('/:id/status', updateDocumentStatus);
router.patch('/:id/progress', updateDocumentProgress);

export default router;
