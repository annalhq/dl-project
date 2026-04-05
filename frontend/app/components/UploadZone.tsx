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

      if (mp3s.length > 0) onFilesAdded(mp3s);
    },
    [onFilesAdded],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  };

  const open = () => inputRef.current?.click();

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload MP3 files"
        onClick={open}
        onKeyDown={(e) => e.key === "Enter" && open()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          "group flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed px-6 py-14 cursor-pointer",
          "transition-colors duration-150 select-none outline-none",
          "focus-visible:ring-2 focus-visible:ring-base-content/20",
          dragOver
            ? "border-base-content/30 bg-base-content/5"
            : "border-base-content/15 hover:border-base-content/25 hover:bg-base-content/2",
        ].join(" ")}
      >
        {/* Icon */}
        <div
          className={`transition-transform duration-200 text-base-content/30 ${dragOver ? "scale-110 text-base-content/50" : "group-hover:text-base-content/40"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.2}
            stroke="currentColor"
            className="w-10 h-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
            />
          </svg>
        </div>

        {/* Copy */}
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-base-content/80 tracking-tight">
            {dragOver ? "Drop to upload" : "Drop MP3s here"}
          </p>
          <p className="text-xs text-base-content/35">
            or{" "}
            <span className="underline underline-offset-2 decoration-base-content/25 hover:text-base-content/60 transition-colors">
              browse files
            </span>
          </p>
        </div>

        {/* Format badge */}
        <span className="px-2 py-0.5 text-xs font-mono tracking-widest text-base-content/55 border border-base-content/10 rounded uppercase">
          .mp3
        </span>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".mp3,audio/mpeg"
          multiple
          onChange={onFileChange}
        />
      </div>

      {/* Rejected files notice */}
      {rejected.length > 0 && (
        <div className="flex items-center gap-2.5 rounded-lg border border-warning/20 bg-warning/8 px-3.5 py-2.5 text-xs text-warning-content/80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-3.5 w-3.5 shrink-0 text-warning/70"
          >
            <path
              fillRule="evenodd"
              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            <strong className="font-semibold">{rejected.length}</strong> file
            {rejected.length !== 1 ? "s" : ""} rejected — MP3 only
          </span>
        </div>
      )}
    </div>
  );
}
