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
}

const UploadZone = ({ onUploadComplete }: UploadZoneProps) => {
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
          message: `${acceptedFiles.length} file${acceptedFiles.length !== 1 ? 's' : ''} uploaded — processing started`,
        });
        onUploadComplete();
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Upload failed. Please try again.';
        setUploadStatus({ type: 'error', message: msg });
      } finally {
        setUploading(false);
        setTimeout(() => setUploadStatus(null), 5000);
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

  return (
    <div className="p-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden
          ${uploading ? 'opacity-60 cursor-not-allowed border-gray-200' :
            isDragActive
              ? 'border-brand-400 bg-gradient-to-br from-brand-50 to-indigo-50 shadow-glow-sm'
              : 'border-gray-200 hover:border-brand-300 hover:bg-gradient-to-br hover:from-brand-50/40 hover:to-indigo-50/20'
          }`}
      >
        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-400/5 to-indigo-400/5" />
        )}
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Uploading…</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center animate-float">
              <Upload className="w-6 h-6 text-brand-600" />
            </div>
            <p className="text-sm text-brand-600 font-semibold">Drop to upload</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:bg-brand-50 transition-colors">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-700 font-semibold">Drop PDF or TXT files here</p>
              <p className="text-xs text-gray-400 mt-0.5">or click to browse · max 10 MB</p>
            </div>
            <div className="flex gap-2 mt-1">
              {['PDF', 'TXT', 'MD'].map((ext) => (
                <span key={ext} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-mono font-semibold">
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
            ${uploadStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
            }`}
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
