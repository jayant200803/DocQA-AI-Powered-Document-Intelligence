import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import UploadZone from './components/Documents/UploadZone';
import DocumentList from './components/Documents/DocumentList';
import ChatWindow from './components/Chat/ChatWindow';
import { documentAPI } from './services/api';
import { Document } from './types';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      const { data } = await documentAPI.list();
      setDocuments((data.documents as Document[]) || []);
    } catch {
      // silent
    }
  }, []);

  const hasProcessing = documents.some(
    (d) => d.status === 'processing' || d.status === 'uploading'
  );

  useEffect(() => {
    loadDocuments();
    const interval = setInterval(loadDocuments, hasProcessing ? 1000 : 5000);
    return () => clearInterval(interval);
  }, [loadDocuments, hasProcessing]);

  const handleToggleDoc = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleDeleteDoc = async (docId: string) => {
    try {
      await documentAPI.delete(docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      setSelectedDocIds((prev) => prev.filter((id) => id !== docId));
    } catch {
      // silent
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId('');
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: '#0d0f1a' }}>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex min-h-0">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          documents={documents}
          selectedDocIds={selectedDocIds}
          onToggleDoc={handleToggleDoc}
          onNewChat={handleNewChat}
          currentSessionId={currentSessionId}
          onSelectSession={(sid) => setCurrentSessionId(sid)}
        />

        <main className="flex-1 flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-2 bg-white/80 backdrop-blur-sm shrink-0"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2">
              {selectedDocIds.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(76,110,245,0.1)', color: '#4263eb', border: '1px solid rgba(76,110,245,0.2)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  {selectedDocIds.length} doc{selectedDocIds.length !== 1 ? 's' : ''} selected
                </span>
              ) : (
                <span className="text-xs text-gray-400">Select documents from the sidebar</span>
              )}
            </div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
              style={showUpload
                ? { background: 'rgba(76,110,245,0.1)', color: '#4263eb', border: '1px solid rgba(76,110,245,0.2)' }
                : { background: 'rgba(0,0,0,0.04)', color: '#6b7280', border: '1px solid rgba(0,0,0,0.07)' }
              }
            >
              {showUpload ? '✕ Close' : '+ Upload'}
            </button>
          </div>

          {showUpload && (
            <div className="bg-white shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <UploadZone onUploadComplete={loadDocuments} />
              <DocumentList documents={documents} onDelete={handleDeleteDoc} />
            </div>
          )}

          <ChatWindow
            selectedDocIds={selectedDocIds}
            sessionId={currentSessionId}
            onSessionChange={setCurrentSessionId}
          />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
