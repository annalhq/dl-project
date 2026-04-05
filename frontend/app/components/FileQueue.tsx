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
      {/* Summary stats bar */}
      <div className="flex items-center gap-4 rounded-xl bg-base-200/60 border border-base-content/8 px-4 py-3">
        <div className="flex items-center gap-6 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary/60" />
            <span className="text-sm font-medium text-base-content/80">
              {files.length} <span className="text-base-content/50 font-normal">file{files.length !== 1 ? "s" : ""}</span>
            </span>
          </div>
          <div className="h-4 w-px bg-base-content/10" />
          <span className="text-sm font-mono tabular-nums text-base-content/60">
            {formatFileSize(totalSize)}
          </span>
        </div>
        <button
          onClick={onClearAll}
          className="btn btn-ghost btn-xs text-error/70 hover:text-error hover:bg-error/10 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* File list */}
      <div className="rounded-xl border border-base-content/8 overflow-hidden bg-base-100">
        {/* Header */}
        <div className="flex items-center px-4 py-2.5 bg-base-200/40 border-b border-base-content/8 text-xs font-mono uppercase tracking-wider text-base-content/40 font-medium">
          <span className="w-10">#</span>
          <span className="flex-1">Filename</span>
          <span className="w-24 text-right">Size</span>
          <span className="w-10" />
        </div>

        {/* Rows */}
        <div className="divide-y divide-base-content/6">
          {files.map((f, i) => (
            <div
              key={f.name}
              className="group flex items-center px-4 py-3 hover:bg-base-content/3 transition-colors duration-150"
            >
              <span className="w-10 font-mono text-xs tabular-nums text-base-content/35 font-medium">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="flex flex-1 items-center gap-2.5 min-w-0">
                {/* Music icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0 text-base-content/25 group-hover:text-primary/60 transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V4.103" />
                </svg>
                <span className="truncate text-sm font-medium text-base-content/80 group-hover:text-base-content transition-colors">
                  {f.name.replace(/\.mp3$/i, "")}
                </span>
                <span className="badge badge-xs badge-ghost font-mono text-[10px] uppercase tracking-widest text-base-content/40">
                  mp3
                </span>
              </div>

              <span className="w-24 text-right font-mono text-xs tabular-nums text-base-content/45">
                {formatFileSize(f.size)}
              </span>

              <div className="w-10 flex justify-end">
                <button
                  onClick={() => onRemove(f.name)}
                  aria-label={`Remove ${f.name}`}
                  className="btn btn-ghost btn-xs btn-circle text-base-content/20 hover:text-error hover:bg-error/10 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
