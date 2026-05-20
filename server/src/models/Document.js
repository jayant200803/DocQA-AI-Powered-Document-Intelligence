import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'txt'],
      required: true,
    },
    filePath: {
      type: String, // local path or S3 key
      required: true,
    },
    status: {
      type: String,
      enum: ['uploading', 'processing', 'ready', 'failed'],
      default: 'uploading',
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
      default: null,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    summary: {
      type: String,
      default: null,
    },
    progressStep: {
      type: String,
      default: null,
    },
    progressIndex: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
