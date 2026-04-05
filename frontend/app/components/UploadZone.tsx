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
    <div className="space-y-3">
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
        <div
          className={`text-5xl animate-float ${
            dragOver ? "scale-110" : ""
          } transition-transform duration-200`}
        >
          🎵
        </div>
        <div className="text-center">
          <p className="text-base-content font-semibold text-lg">
            Drop MP3 files here
          </p>
          <p className="text-base-content/50 text-sm mt-1">
            or{" "}
            <span className="text-primary font-medium cursor-pointer underline underline-offset-2">
              click to browse
            </span>
          </p>
        </div>
        <div className="flex gap-2 mt-1">
          <span className="badge badge-ghost badge-sm">.mp3</span>
          <span className="badge badge-ghost badge-sm">audio/mpeg</span>
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
            className="file-input file-input-bordered file-input-primary file-input-sm w-full"
            accept=".mp3,audio/mpeg"
            multiple
            onChange={onFileChange}
          />
        </label>
      </div>

      {/* Rejected files alert */}
      {rejected.length > 0 && (
        <div className="alert alert-warning alert-sm animate-fade-up">
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
          <span>
            <strong>{rejected.length}</strong> file{rejected.length !== 1 ? "s" : ""} rejected — only MP3 files are supported.
          </span>
        </div>
      )}
    </div>
  );
}
