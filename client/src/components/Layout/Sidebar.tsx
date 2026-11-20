import { useState, useEffect, ReactElement } from 'react';
import { Plus, MessageSquare, Trash2, X, CheckCircle2, Loader2, AlertCircle, FileText, Upload } from 'lucide-react';
import { chatAPI } from '../../services/api';
import { Wordmark } from '@/components/ui/wordmark';
import { Document, ChatSession } from '../../types';
import UploadZone from '../Documents/UploadZone';

const statusDot: Record<Document['status'], ReactElement> = {
  ready:      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />,
  processing: <Loader2 className="w-3 h-3 text-amber-400 animate-spin shrink-0" />,
  failed:     <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />,
  uploading:  <Loader2 className="w-3 h-3 text-faint animate-spin shrink-0" />,
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  selectedDocIds: string[];
  onToggleDoc: (id: string) => void;
  onDeleteDoc: (id: string) => void;
  onNewChat: () => void;
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onDocumentsChange: () => void;
}

const Sidebar = ({
  isOpen, onClose, documents, selectedDocIds,
  onToggleDoc, onDeleteDoc, onNewChat, currentSessionId,
  onSelectSession, onDocumentsChange,
}: SidebarProps) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => { loadSessions(); }, []);

  const loadSessions = async () => {
    try {
      const { data } = await chatAPI.getSessions();
      setSessions((data.sessions as ChatSession[]) || []);
    } catch { /* silent */ }
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await chatAPI.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    } catch { /* silent */ }
  };

  const handleUploadComplete = () => {
    onDocumentsChange();
    setShowUpload(false);
  };

  const readyDocs = documents.filter((d) => d.status === 'ready');
  const busyDocs  = documents.filter((d) => d.status !== 'ready');

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col bg-surface border-r border-line transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Mobile brand header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 shrink-0 border-b border-line">
          <Wordmark size="sm" />
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop top spacing */}
        <div className="hidden lg:block h-3 shrink-0" />

        {/* New Chat */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <button onClick={() => { onNewChat(); onClose(); }} className="btn-primary w-full">
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Documents section */}
        <div className="px-3 pb-2 shrink-0">
          <div className="flex items-center justify-between px-1 mb-2">
            <p className="text-[10px] font-semibold text-faint uppercase tracking-widest">
              Documents
            </p>
            <button
              onClick={() => setShowUpload((v) => !v)}
              title="Upload document"
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-colors duration-150 ${
                showUpload
                  ? 'text-accent border-accent bg-[rgba(240,106,60,0.12)]'
                  : 'text-muted border-line bg-surface-2 hover:border-line-strong'
              }`}
            >
              <Upload className="w-2.5 h-2.5" />
              Upload
            </button>
          </div>

          {/* Collapsible upload zone */}
          {showUpload && (
            <div className="mb-2 rounded-lg overflow-hidden border border-line bg-surface-2">
              <UploadZone onUploadComplete={handleUploadComplete} compact />
            </div>
          )}

          <div className="space-y-0.5 max-h-52 overflow-y-auto">
            {documents.length === 0 ? (
              <p className="text-xs text-faint px-2 py-2">No documents — click Upload above</p>
            ) : (
              <>
                {readyDocs.map((doc) => {
                  const sel = selectedDocIds.includes(doc._id);
                  return (
                    <div
                      key={doc._id}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer select-none group border transition-colors duration-150 ${
                        sel ? 'bg-[rgba(240,106,60,0.1)] border-accent' : 'border-transparent hover:bg-white/5'
                      }`}
                      onClick={() => onToggleDoc(doc._id)}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors duration-150
                        ${sel ? 'bg-accent border-accent' : 'border-line-strong group-hover:border-muted'}`}>
                        {sel && <span className="text-white text-[8px] font-bold leading-none">✓</span>}
                      </div>
                      <FileText className={`w-3 h-3 shrink-0 ${sel ? 'text-accent' : 'text-faint'}`} />
                      <span className={`text-xs truncate flex-1 ${sel ? 'text-ink font-medium' : 'text-muted group-hover:text-ink'}`}>
                        {doc.fileName}
                      </span>
                      {statusDot[doc.status]}
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc._id); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-faint hover:text-red-400 transition-all duration-150 shrink-0"
                        title="Delete document"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
                {busyDocs.map((doc) => (
                  <div key={doc._id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg select-none opacity-40 border border-transparent">
                    <div className="w-3.5 h-3.5 rounded border border-line-strong shrink-0" />
                    <FileText className="w-3 h-3 text-faint shrink-0" />
                    <span className="text-xs text-muted truncate flex-1">{doc.fileName}</span>
                    {statusDot[doc.status]}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-3 shrink-0 h-px bg-line" />

        {/* Chat history */}
        <div className="px-3 pt-3 flex-1 overflow-y-auto min-h-0">
          <p className="text-[10px] font-semibold text-faint uppercase tracking-widest px-1 mb-2">
            History
          </p>
          <div className="space-y-0.5 pb-4">
            {sessions.length === 0 ? (
              <p className="text-xs text-faint px-2 py-2">No conversations yet</p>
            ) : (
              sessions.map((session) => {
                const active = currentSessionId === session.sessionId;
                return (
                  <div
                    key={session.sessionId}
                    onClick={() => { onSelectSession(session.sessionId); onClose(); }}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer group border transition-colors duration-150 select-none ${
                      active ? 'bg-surface-2 border-line' : 'border-transparent hover:bg-white/5'
                    }`}
                  >
                    <MessageSquare className={`w-3 h-3 shrink-0 ${active ? 'text-accent' : 'text-faint'}`} />
                    <span className={`text-xs truncate flex-1 ${active ? 'text-ink' : 'text-muted group-hover:text-ink'}`}>
                      {session.title}
                    </span>
                    <button
                      onClick={(e) => handleDeleteSession(e, session.sessionId)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-faint hover:text-red-400 transition-all duration-150"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Active docs indicator */}
        {selectedDocIds.length > 0 && (
          <div className="px-3 py-3 shrink-0 border-t border-line">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-accent bg-[rgba(240,106,60,0.1)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="text-xs text-ink font-medium">
                {selectedDocIds.length} doc{selectedDocIds.length !== 1 ? 's' : ''} active
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
