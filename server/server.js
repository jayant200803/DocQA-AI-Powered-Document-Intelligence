import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import http from 'http';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { initWebSocket } from './src/services/websocket.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  // Connect to MongoDB
  await connectDB();

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize WebSocket
  initWebSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
