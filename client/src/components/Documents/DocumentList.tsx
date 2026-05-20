import DocumentCard from './DocumentCard';
import { Document } from '../../types';

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
}

const DocumentList = ({ documents, onDelete }: DocumentListProps) => {
  if (documents.length === 0) return null;

  return (
    <div className="px-4 pb-4 space-y-2">
      {documents.map((doc) => (
        <DocumentCard key={doc._id} document={doc} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default DocumentList;
