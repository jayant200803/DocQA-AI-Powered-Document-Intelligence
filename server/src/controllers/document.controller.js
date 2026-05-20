import Document from '../models/Document.js';
import { ingestDocument, deleteDocumentVectors } from '../services/aiService.js';
import path from 'path';
import fs from 'fs';

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const fileType = ext === 'pdf' ? 'pdf' : 'txt';

    // Create document record
    const doc = await Document.create({
      userId: req.user.userId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType,
      filePath: req.file.path,
      status: 'processing',
    });

    // Send to AI service for ingestion (async — returns immediately)
    try {
      await ingestDocument(req.file.path, doc._id.toString(), req.user.userId, req.file.originalname);
    } catch (error) {
      console.error('Ingestion request failed:', error);
      doc.status = 'failed';
      doc.error = error.message;
      await doc.save();
    }

    res.status(201).json({
      document: {
        id: doc._id,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed.' });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.userId })
      .sort({ uploadedAt: -1 })
      .select('-filePath');

    res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents.' });
  }
};

export const getDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    }).select('-filePath');

    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    res.json({ document: doc });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document.' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Delete local file if exists
    if (doc.filePath && fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    // Delete vectors from Pinecone
    try {
      await deleteDocumentVectors(doc._id.toString());
    } catch (error) {
      console.error('Failed to delete Pinecone vectors (non-fatal):', error);
    }

    await Document.deleteOne({ _id: doc._id });

    res.json({ message: 'Document deleted.' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document.' });
  }
};

// Internal callback from AI service — update final status
export const updateDocumentStatus = async (req, res) => {
  try {
    const { status, chunkCount, error: errorMsg, summary } = req.body;

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    doc.status = status;
    if (chunkCount !== undefined) doc.chunkCount = chunkCount;
    if (errorMsg) doc.error = errorMsg;
    if (summary) doc.summary = summary;
    if (status === 'ready' || status === 'failed') {
      doc.processedAt = new Date();
      doc.progressStep = null;
      doc.progressIndex = null;
    }

    await doc.save();

    res.json({ message: 'Status updated.' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status.' });
  }
};

// Internal callback from AI service — update live progress step
export const updateDocumentProgress = async (req, res) => {
  try {
    const { step, index } = req.body;

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    doc.progressStep = step;
    doc.progressIndex = index;
    await doc.save();

    res.json({ message: 'Progress updated.' });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress.' });
  }
};
