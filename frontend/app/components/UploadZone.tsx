"use client";

import { useRef, useCallback, useState } from "react";

interface UploadZoneProps {
  onFilesAdded: (files: FileList | File[]) => void;
}

export default function UploadZone({ onFilesAdded }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);

  const handleFiles = useCallback(
    (incoming: FileList | File[]) => {
      const all = Array.from(incoming);
      const mp3s = all.filter((f) => f.name.toLowerCase().endsWith(".mp3"));
      const nonMp3s = all.filter((f) => !f.name.toLowerCase().endsWith(".mp3"));

      if (nonMp3s.length > 0) {
        setRejected(nonMp3s.map((f) => f.name));
        setTimeout(() => setRejected([]), 4000);
      }

      if (mp3s.length > 0) {
        onFilesAdded(mp3s);
      }
    },
    [onFilesAdded]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        id="dropzone"
        role="button"
        tabIndex={0}
        aria-label="Upload MP3 files"
        className={`dropzone flex flex-col items-center justify-center py-16 gap-3 ${
          dragOver ? "drag-over" : ""
        }`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className={`transition-transform duration-200 text-base-content/50 ${dragOver ? "scale-110" : ""}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-base-content font-medium text-lg tracking-tight">
            Select files to analyze
          </p>
          <p className="text-base-content/50 text-sm mt-1 font-light">
            or drag and drop them here
          </p>
        </div>
        <div className="flex gap-2 mt-2">
          <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-base-content/40 border border-base-content/10 rounded uppercase">MP3</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          id="file-input"
          className="hidden"
          accept=".mp3,audio/mpeg"
          multiple
          onChange={onFileChange}
        />
      </div>

      {/* Alternative file input */}
      <div className="flex items-center justify-center">
        <label className="form-control w-full max-w-sm">
          <input
            type="file"
            className="file-input file-input-bordered file-input-sm w-full font-mono text-xs"
            accept=".mp3,audio/mpeg"
            multiple
            onChange={onFileChange}
          />
        </label>
      </div>

      {/* Rejected files alert */}
      {rejected.length > 0 && (
        <div className="alert alert-warning alert-sm animate-fade-up rounded border-l-4 border-warning bg-warning/10 text-warning-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span className="font-medium text-xs">
            <strong>{rejected.length}</strong> invalid format{rejected.length !== 1 ? "s" : ""} — MP3 exclusively.
          </span>
        </div>
      )}
    </div>
  );
}
