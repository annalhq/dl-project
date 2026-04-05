"use client";

import { formatFileSize } from "../lib/constants";

interface FileQueueProps {
  files: File[];
  onRemove: (name: string) => void;
  onClearAll: () => void;
}

export default function FileQueue({
  files,
  onRemove,
  onClearAll,
}: FileQueueProps) {
  if (files.length === 0) return null;

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-stretch rounded-lg border border-base-content/8 overflow-hidden">
        <div className="flex-1 px-5 py-3 border-r border-base-content/8">
          <p className="font-mono text-xs uppercase tracking-widest text-base-content/55">
            Files
          </p>
          <p className="mt-1 text-lg font-medium tracking-tight tabular-nums">
            {files.length}
          </p>
        </div>
        <div className="flex-1 px-5 py-3 border-r border-base-content/8">
          <p className="font-mono text-xs uppercase tracking-widest text-base-content/55">
            Size
          </p>
          <p className="mt-1 text-lg font-medium tracking-tight tabular-nums">
            {formatFileSize(totalSize)}
          </p>
        </div>
        <div className="flex items-center px-4">
          <button
            onClick={onClearAll}
            className="font-mono text-xs uppercase tracking-widest text-base-content/60 hover:text-error transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* File list */}
      <div className="rounded-lg border border-base-content/8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center px-4 py-2 border-b border-base-content/8 font-mono text-xs uppercase tracking-widest text-base-content/55">
          <span className="w-8">#</span>
          <span className="flex-1">File</span>
          <span className="w-20 text-right">Size</span>
          <span className="w-8" />
        </div>

        {/* Rows */}
        {files.map((f, i) => (
          <div
            key={f.name}
            className="group flex items-center px-4 py-2.5 border-b border-base-content/5 last:border-0 hover:bg-base-content/2.5 transition-colors"
          >
            <span className="w-8 font-mono text-xs tabular-nums text-base-content/55">
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="flex flex-1 items-center gap-2 min-w-0">
              <span className="truncate text-[13px] font-medium tracking-tight text-base-content/75 group-hover:text-base-content/90 transition-colors">
                {f.name.replace(/\.mp3$/i, "")}
              </span>
              <span className="shrink-0 rounded px-1.5 py-0.5 font-mono text-xs uppercase tracking-widest border border-base-content/8 text-base-content/55">
                mp3
              </span>
            </div>

            <span className="w-20 text-right font-mono text-xs tabular-nums text-base-content/60">
              {formatFileSize(f.size)}
            </span>

            <div className="w-8 flex justify-end">
              <button
                onClick={() => onRemove(f.name)}
                aria-label={`Remove ${f.name}`}
                className="text-base-content/20 hover:text-error transition-colors text-sm leading-none p-1 rounded hover:bg-error/8"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
