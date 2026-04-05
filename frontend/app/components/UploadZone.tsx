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
    <div className="space-y-4">
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
          "group relative flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed px-6 py-16 cursor-pointer",
          "transition-all duration-250 select-none outline-none",
          "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100",
          dragOver
            ? "border-primary/60 bg-primary/8 shadow-lg shadow-primary/5"
            : "border-base-content/15 hover:border-primary/40 hover:bg-base-content/3",
        ].join(" ")}
      >
        {/* Ambient glow on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,oklch(72%_0.19_154_/_0.06),transparent_70%)]" />

        {/* Upload icon */}
        <div
          className={`relative transition-all duration-300 ${dragOver ? "scale-110 text-primary" : "text-base-content/30 group-hover:text-primary/70"}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-base-content/5 group-hover:bg-primary/10 flex items-center justify-center transition-colors duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
              />
            </svg>
          </div>
        </div>

        {/* Copy */}
        <div className="relative text-center space-y-2">
          <p className="text-base font-semibold text-base-content/90">
            {dragOver ? "Release to upload" : "Drop your MP3 files here"}
          </p>
          <p className="text-sm text-base-content/50">
            or{" "}
            <span className="text-primary/80 font-medium underline underline-offset-4 decoration-primary/30 group-hover:decoration-primary/60 transition-colors">
              browse from your computer
            </span>
          </p>
        </div>

        {/* Format badge */}
        <div className="relative badge badge-outline badge-sm font-mono tracking-widest text-base-content/50 border-base-content/15 px-3 py-2.5">
          .MP3 FORMAT
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".mp3,audio/mpeg"
          multiple
          onChange={onFileChange}
        />
      </div>

      {/* Rejected files alert */}
      {rejected.length > 0 && (
        <div role="alert" className="alert alert-warning shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="font-semibold text-sm">
              {rejected.length} file{rejected.length !== 1 ? "s" : ""} rejected
            </h3>
            <p className="text-xs opacity-80">Only MP3 audio files are supported</p>
          </div>
        </div>
      )}
    </div>
  );
}
