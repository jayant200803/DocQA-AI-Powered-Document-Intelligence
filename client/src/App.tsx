import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import ChatWindow from './components/Chat/ChatWindow';
import { documentAPI } from './services/api';
import { Document } from './types';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0c0f' }}>
        <div className="w-7 h-7 border-2 border-white/10 border-t-brand-500 rounded-full animate-spin" />
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
    <div className="h-screen flex flex-col" style={{ background: '#0c0c0f' }}>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex min-h-0">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          documents={documents}
          selectedDocIds={selectedDocIds}
          onToggleDoc={handleToggleDoc}
          onDeleteDoc={handleDeleteDoc}
          onNewChat={handleNewChat}
          currentSessionId={currentSessionId}
          onSelectSession={(sid) => setCurrentSessionId(sid)}
          onDocumentsChange={loadDocuments}
        />

        <main className="flex-1 flex flex-col min-h-0">
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
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
