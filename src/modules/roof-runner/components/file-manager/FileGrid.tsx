import FileCard from './FileCard';

interface File {
  id: string;
  name: string;
  type: string;
  pages: number;
  thumbnail: string;
}

interface FileGridProps {
  files: File[];
}

export default function FileGrid({ files }: FileGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {files.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  );
}