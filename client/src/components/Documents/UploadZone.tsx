import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { documentAPI } from '../../services/api';

interface UploadStatus {
  type: 'success' | 'error';
  message: string;
}

interface UploadZoneProps {
  onUploadComplete: () => void;
  compact?: boolean;
}

const UploadZone = ({ onUploadComplete, compact = false }: UploadZoneProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setUploading(true);
      setUploadStatus(null);
      try {
        for (const file of acceptedFiles) {
          await documentAPI.upload(file);
        }
        setUploadStatus({
          type: 'success',
          message: `${acceptedFiles.length} file${acceptedFiles.length !== 1 ? 's' : ''} uploaded`,
        });
        onUploadComplete();
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Upload failed. Please try again.';
        setUploadStatus({ type: 'error', message: msg });
      } finally {
        setUploading(false);
        setTimeout(() => setUploadStatus(null), 4000);
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt', '.text', '.md'],
    },
    maxSize: 10 * 1024 * 1024,
    disabled: uploading,
  });

  if (compact) {
    return (
      <div className="p-2">
        <div
          {...getRootProps()}
          className={`relative border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-200
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={isDragActive
            ? { borderColor: 'rgba(99,102,241,0.6)', background: 'rgba(99,102,241,0.08)' }
            : { borderColor: 'rgba(255,255,255,0.1)', background: 'transparent' }
          }
        >
          <input {...getInputProps()} />

          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />
              <span className="text-xs text-slate-500">Uploading…</span>
            </div>
          ) : isDragActive ? (
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-xs text-brand-300 font-medium">Drop to upload</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-xs text-slate-600">Drop PDF or TXT · max 10 MB</span>
            </div>
          )}
        </div>

        {uploadStatus && (
          <div
            className={`mt-1.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium animate-fadeUp
              ${uploadStatus.type === 'success'
                ? 'text-emerald-400'
                : 'text-red-400'
              }`}
            style={uploadStatus.type === 'success'
              ? { background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)' }
              : { background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }
            }
          >
            {uploadStatus.type === 'success'
              ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              : <XCircle className="w-3.5 h-3.5 shrink-0" />
            }
            <span className="truncate">{uploadStatus.message}</span>
          </div>
        )}
      </div>
    );
  }

  // Full-size variant (kept for backwards compatibility)
  return (
    <div className="p-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={isDragActive
          ? { borderColor: 'rgba(99,102,241,0.6)', background: 'rgba(99,102,241,0.06)' }
          : { borderColor: 'rgba(255,255,255,0.1)', background: 'transparent' }
        }
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.1)' }}>
              <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
            </div>
            <p className="text-sm text-slate-500 font-medium">Uploading…</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.12)' }}>
              <Upload className="w-6 h-6 text-brand-400" />
            </div>
            <p className="text-sm text-brand-300 font-semibold">Drop to upload</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Upload className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-semibold">Drop PDF or TXT files here</p>
              <p className="text-xs text-slate-600 mt-0.5">or click to browse · max 10 MB</p>
            </div>
            <div className="flex gap-2 mt-1">
              {['PDF', 'TXT', 'MD'].map((ext) => (
                <span key={ext} className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold text-slate-600"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  .{ext.toLowerCase()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {uploadStatus && (
        <div
          className={`mt-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium animate-fadeUp
            ${uploadStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
          style={uploadStatus.type === 'success'
            ? { background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)' }
            : { background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }
          }
        >
          {uploadStatus.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <XCircle className="w-4 h-4 shrink-0" />
          }
          {uploadStatus.message}
        </div>
      )}
    </div>
  );
};

export default UploadZone;
