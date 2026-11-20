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

  // Success/error toast — shared by both variants.
  const statusToast = uploadStatus && (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium animate-fadeUp border ${
        uploadStatus.type === 'success'
          ? 'text-emerald-400 bg-[rgba(52,211,153,0.07)] border-[rgba(52,211,153,0.15)]'
          : 'text-red-400 bg-[rgba(239,68,68,0.07)] border-[rgba(239,68,68,0.15)]'
      }`}
    >
      {uploadStatus.type === 'success'
        ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        : <XCircle className="w-3.5 h-3.5 shrink-0" />
      }
      <span className="truncate">{uploadStatus.message}</span>
    </div>
  );

  if (compact) {
    return (
      <div className="p-2">
        <div
          {...getRootProps()}
          className={`border border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors duration-150 ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          } ${isDragActive ? 'border-accent bg-[rgba(59,130,246,0.08)]' : 'border-line-strong'}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
              <span className="text-xs text-muted">Uploading…</span>
            </div>
          ) : isDragActive ? (
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs text-accent font-medium">Drop to upload</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-3.5 h-3.5 text-faint" />
              <span className="text-xs text-faint">Drop PDF or TXT · max 10 MB</span>
            </div>
          )}
        </div>
        {uploadStatus && <div className="mt-1.5">{statusToast}</div>}
      </div>
    );
  }

  // Full-size variant
  return (
    <div className="p-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-150 ${
          uploading ? 'opacity-50 cursor-not-allowed' : ''
        } ${isDragActive ? 'border-accent bg-[rgba(59,130,246,0.06)]' : 'border-line-strong'}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center card">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
            <p className="text-sm text-muted font-medium">Uploading…</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center card">
              <Upload className="w-6 h-6 text-accent" />
            </div>
            <p className="text-sm text-accent font-semibold">Drop to upload</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center card">
              <Upload className="w-6 h-6 text-faint" />
            </div>
            <div>
              <p className="text-sm text-ink font-semibold">Drop PDF or TXT files here</p>
              <p className="text-xs text-faint mt-0.5">or click to browse · max 10 MB</p>
            </div>
            <div className="flex gap-2 mt-1">
              {['PDF', 'TXT', 'MD'].map((ext) => (
                <span key={ext} className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold text-faint bg-surface-2 border border-line">
                  .{ext.toLowerCase()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      {uploadStatus && <div className="mt-3">{statusToast}</div>}
    </div>
  );
};

export default UploadZone;
