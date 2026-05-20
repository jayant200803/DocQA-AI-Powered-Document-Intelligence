import { useState, useEffect, ReactElement } from 'react';
import { Plus, MessageSquare, Trash2, X, CheckCircle2, Loader2, AlertCircle, Sparkles, FileText } from 'lucide-react';
import { chatAPI } from '../../services/api';
import { Document, ChatSession } from '../../types';

const statusDot: Record<Document['status'], ReactElement> = {
  ready:      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />,
  processing: <Loader2 className="w-3 h-3 text-amber-400 animate-spin shrink-0" />,
  failed:     <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />,
  uploading:  <Loader2 className="w-3 h-3 text-slate-500 animate-spin shrink-0" />,
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  selectedDocIds: string[];
  onToggleDoc: (id: string) => void;
  onNewChat: () => void;
  currentSessionId: string;
  onSelectSession: (id: string) => void;
}

const Sidebar = ({
  isOpen, onClose, documents, selectedDocIds,
  onToggleDoc, onNewChat, currentSessionId, onSelectSession,
}: SidebarProps) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

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

  const readyDocs = documents.filter((d) => d.status === 'ready');
  const busyDocs  = documents.filter((d) => d.status !== 'ready');

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: '#0d0f1a', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Brand header — mobile only (desktop has the top Header) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4c6ef5, #4263eb)', boxShadow: '0 0 12px rgba(76,110,245,0.4)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-white font-bold text-sm tracking-tight">DocQA</span>
              <span className="text-slate-600 font-mono text-[10px]">AI</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop spacer at top */}
        <div className="hidden lg:block h-3 shrink-0" />

        {/* New chat */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <button
            onClick={() => { onNewChat(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #4c6ef5, #4263eb)',
              boxShadow: '0 0 20px rgba(76,110,245,0.28), 0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Documents */}
        <div className="px-3 pb-2 shrink-0">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-1 mb-2">
            Documents
          </p>
          <div className="space-y-0.5 max-h-56 overflow-y-auto dark-scroll">
            {documents.length === 0 ? (
              <p className="text-xs text-slate-600 px-2 py-2">No documents yet</p>
            ) : (
              <>
                {readyDocs.map((doc) => {
                  const sel = selectedDocIds.includes(doc._id);
                  return (
                    <label
                      key={doc._id}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-150 select-none group"
                      style={sel
                        ? { background: 'rgba(76,110,245,0.14)', border: '1px solid rgba(76,110,245,0.22)' }
                        : { border: '1px solid transparent' }
                      }
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all duration-150
                        ${sel ? 'bg-brand-500 border-brand-500' : 'border-slate-600 group-hover:border-slate-400'}`}>
                        {sel && <span className="text-white text-[9px] font-bold leading-none">✓</span>}
                      </div>
                      <FileText className={`w-3.5 h-3.5 shrink-0 ${sel ? 'text-brand-400' : 'text-slate-600'}`} />
                      <span className={`text-xs truncate flex-1 ${sel ? 'text-slate-200 font-medium' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {doc.fileName}
                      </span>
                      <input type="checkbox" className="sr-only" checked={sel} onChange={() => onToggleDoc(doc._id)} />
                      {statusDot[doc.status]}
                    </label>
                  );
                })}
                {busyDocs.map((doc) => (
                  <div key={doc._id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl select-none opacity-40">
                    <div className="w-4 h-4 rounded-md border border-slate-700 shrink-0" />
                    <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="text-xs text-slate-600 truncate flex-1">{doc.fileName}</span>
                    {statusDot[doc.status]}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-3 shrink-0" style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

        {/* Chat history */}
        <div className="px-3 pt-3 flex-1 overflow-y-auto dark-scroll min-h-0">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-1 mb-2">
            History
          </p>
          <div className="space-y-0.5 pb-4">
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-600 px-2 py-2">No conversations yet</p>
            ) : (
              sessions.map((session) => {
                const active = currentSessionId === session.sessionId;
                return (
                  <div
                    key={session.sessionId}
                    onClick={() => { onSelectSession(session.sessionId); onClose(); }}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer group transition-all duration-150 select-none"
                    style={active
                      ? { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }
                      : { border: '1px solid transparent' }
                    }
                  >
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-brand-400' : 'text-slate-600'}`} />
                    <span className={`text-xs truncate flex-1 ${active ? 'text-slate-200' : 'text-slate-500 group-hover:text-slate-300'}`}>
                      {session.title}
                    </span>
                    <button
                      onClick={(e) => handleDeleteSession(e, session.sessionId)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected docs indicator */}
        {selectedDocIds.length > 0 && (
          <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(76,110,245,0.1)', border: '1px solid rgba(76,110,245,0.18)' }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="text-xs text-brand-300 font-medium">
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
