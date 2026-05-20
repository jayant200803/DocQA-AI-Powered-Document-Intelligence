import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    chunkText: String,
    chunkIndex: Number,
    relevanceScore: Number,
    fileName: String,
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sources: [sourceSchema],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      default: 'New Chat',
    },
    messages: [messageSchema],
    documentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  },
  { timestamps: true }
);

export default mongoose.model('ChatHistory', chatHistorySchema);
