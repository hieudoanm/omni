'use client';

import { FC, useRef, useState, useCallback } from 'react';

interface DropzoneProps {
  accept?: string;
  onFile: (file: File) => void;
  multiple?: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Dropzone: FC<DropzoneProps> = ({
  accept,
  onFile,
  multiple = false,
  label,
  disabled = false,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;
      setFileName(multiple ? `${files.length} file(s)` : files[0].name);
      if (multiple) {
        files.forEach((f) => onFile(f));
      } else {
        onFile(files[0]);
      }
    },
    [onFile, multiple],
  );

  return (
    <>
      <input
        ref={inputRef}
        type='file'
        {...(accept ? { accept } : {})}
        multiple={multiple}
        className='hidden'
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
        disabled={disabled}
      />
      <div
        role='button'
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click();
        }}
        className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm transition-colors ${
          disabled
            ? 'cursor-not-allowed opacity-40'
            : dragging
              ? 'border-primary bg-primary/10'
              : 'border-base-300 hover:border-base-content/50'
        } ${className}`}>
        <svg
          className='h-6 w-6 opacity-60'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5'
          />
        </svg>
        <span className='opacity-60'>{label ?? 'Drop a file here or click to browse'}</span>
        {fileName && <span className='text-xs opacity-40'>{fileName}</span>}
      </div>
    </>
  );
};
Dropzone.displayName = 'Dropzone';
