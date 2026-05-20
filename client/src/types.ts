export interface User {
  _id: string;
  email: string;
  name: string;
}

export interface Document {
  _id: string;
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'txt';
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  chunkCount: number;
  uploadedAt: string;
  processedAt?: string;
  summary?: string;
  progressStep?: string;
  progressIndex?: number;
}

export interface Source {
  documentId: string;
  fileName: string;
  chunkText: string;
  chunkIndex: number;
  relevanceScore: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources: Source[];
  timestamp: string;
  suggestions?: string[];
}

export interface ChatSession {
  sessionId: string;
  title: string;
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface WebSocketHook {
  connect: () => void;
  disconnect: () => void;
  sendMessage: (question: string, documentIds: string[], sessionId: string) => void;
  on: (type: string, handler: (msg: WsMessage) => void) => void;
  off: (type: string) => void;
  isConnected: boolean;
  isStreaming: boolean;
  stopStreaming: () => void;
}

export interface WsMessage {
  type: string;
  data?: string | Source[];
  sessionId?: string;
}
