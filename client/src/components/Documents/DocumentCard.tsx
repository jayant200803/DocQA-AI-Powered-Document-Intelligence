import { ElementType } from 'react';
import { FileText, Trash2, Loader2, CheckCircle2, AlertCircle, Check } from 'lucide-react';
import { Document } from '../../types';

interface StatusConfig {
  icon: ElementType;
  color: string;
  bg: string;
  label: string;
  spin?: boolean;
}

const statusConfig: Record<Document['status'], StatusConfig> = {
  ready: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Ready' },
  processing: { icon: Loader2, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Processing', spin: true },
  failed: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Failed' },
  uploading: { icon: Loader2, color: 'text-gray-400', bg: 'bg-gray-50', label: 'Uploading', spin: true },
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const STEPS = ['Parsing', 'Chunking', 'Embedding', 'Storing'];

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
}

const DocumentCard = ({ document, onDelete }: DocumentCardProps) => {
  const status = statusConfig[document.status] ?? statusConfig.uploading;
  const StatusIcon = status.icon;
  const isProcessing = document.status === 'processing' || document.status === 'uploading';

  return (
    <div className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-gray-100 group hover:border-gray-200 transition-colors">
      {/* Header row */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-brand-600" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{document.fileName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">{formatSize(document.fileSize)}</span>
            {document.chunkCount > 0 && (
              <span className="text-xs text-gray-400">· {document.chunkCount} chunks</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
            <StatusIcon className={`w-3 h-3 ${status.spin ? 'animate-spin' : ''}`} />
            {status.label}
          </span>
          <button
            onClick={() => onDelete(document._id)}
            className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-400 transition-all"
            title="Delete document"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live processing progress stepper */}
      {isProcessing && document.progressStep && (
        <div className="flex items-center gap-0.5 px-1 pb-0.5">
          {STEPS.map((step, i) => {
            const currentIdx = document.progressIndex ?? -1;
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={step} className="flex items-center gap-0.5 flex-1 min-w-0">
                <div className={`flex items-center justify-center w-4 h-4 rounded-full shrink-0 transition-all duration-300
                  ${done ? 'bg-green-500' : active ? 'bg-brand-500' : 'bg-gray-200'}`}>
                  {done ? (
                    <Check className="w-2.5 h-2.5 text-white" />
                  ) : active ? (
                    <Loader2 className="w-2.5 h-2.5 text-white animate-spin" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  )}
                </div>
                <span className={`text-xs truncate transition-colors duration-300
                  ${done ? 'text-green-600' : active ? 'text-brand-600 font-medium' : 'text-gray-400'}`}>
                  {step}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 mx-0.5 transition-colors duration-300
                    ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Auto-generated summary */}
      {document.status === 'ready' && document.summary && (
        <p className="text-xs text-gray-500 leading-relaxed px-1 pb-0.5 border-t border-gray-50 pt-2">
          {document.summary}
        </p>
      )}
    </div>
  );
};

export default DocumentCard;
