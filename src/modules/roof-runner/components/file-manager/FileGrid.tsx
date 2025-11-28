import FileCard from './FileCard';
import { FileItem } from '../../../../shared/services/fileManagerApi';

interface FileGridProps {
  files: FileItem[];
  onDeleteFile: (fileId: number) => void;
}

export default function FileGrid({ files, onDeleteFile }: FileGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {files.map((file) => (
        <FileCard key={file.id} file={file} onDelete={onDeleteFile} />
      ))}
    </div>
  );
}