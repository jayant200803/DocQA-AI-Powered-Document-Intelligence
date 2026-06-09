import express from 'express';
import cors from 'cors';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.routes.js';
import documentRoutes from './routes/document.routes.js';
import chatRoutes from './routes/chat.routes.js';

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────
// Build allowed-origins list at startup so it's stable for the process lifetime.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow no-origin requests (curl, Postman, server-to-server callbacks)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS blocked: ${origin}`);
    callback(new Error(`Origin ${origin} is not allowed by CORS policy.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length'],
  optionsSuccessStatus: 204,
};

// Handle pre-flight for every route first, before any other middleware.
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ───────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'server' });
});

// ── Global error handler ─────────────────────────────────────────────────────
// Must run AFTER cors() so CORS headers are already set.  If an error occurs
// after headers are sent, Express skips this — nothing we can do about that.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message || err);

  if (err.name === 'MulterError') {
    const msg = err.code === 'LIMIT_FILE_SIZE'
      ? 'File too large. Maximum size is 10 MB.'
      : err.message;
    return res.status(400).json({ error: msg });
  }

  // CORS policy error (thrown from origin callback)
  if (err.message?.startsWith('Origin ') && err.message.includes('CORS')) {
    return res.status(403).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error.' });
});

export default app;
