import { useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface DropzoneProps extends Omit<DropzoneOptions, 'onDrop'> {
  onDrop: (acceptedFiles: File[]) => void;
  className?: string;
  label?: string;
}

export function Dropzone({ onDrop, className = '', label = 'Drag & drop files here, or click to select', ...props }: DropzoneProps) {
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    onDrop(acceptedFiles);
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    ...props
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors duration-200 ease-in-out flex flex-col items-center justify-center min-h-[200px]
        ${isDragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      <UploadCloud className={`w-12 h-12 mb-4 ${isDragActive ? 'text-indigo-500' : 'text-slate-400'}`} />
      <p className={`text-lg font-medium ${isDragActive ? 'text-indigo-600' : 'text-slate-600'}`}>
        {isDragActive ? 'Drop files now' : label}
      </p>
      <p className="text-sm text-slate-500 mt-2">
        Supports images and PDFs depending on the tool
      </p>
    </div>
  );
}
