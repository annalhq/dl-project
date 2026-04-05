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
    <div className="animate-fade-up">
      {/* Stats bar */}
      <div className="stats stats-vertical gap-1 rounded-2xl border border-base-300/80 bg-base-100 shadow-sm lg:stats-horizontal lg:gap-0 w-full mb-6 relative">
        <div className="stat">
          <div className="stat-title text-base-content/60">Files Selected</div>
          <div className="stat-value text-primary">{files.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title text-base-content/60">Total Size</div>
          <div className="stat-value text-secondary">
            {formatFileSize(totalSize)}
          </div>
        </div>
        <div className="stat place-items-end justify-center">
          <button
            onClick={onClearAll}
            className="btn btn-outline btn-error btn-sm text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            Clear Selected
          </button>
        </div>
      </div>

      {/* File list */}
      <ul className="list overflow-hidden rounded-xl border border-base-300/80 bg-base-100">
        <li
          className="list-row flex items-center border-b border-base-300/60 bg-base-200/40 px-4 py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-base-content/50"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          <span className="w-10">IDX</span>
          <span className="flex-1">Identifier</span>
          <span className="w-24 text-right">Size</span>
          <span className="w-8"></span>
        </li>
        {files.map((f, i) => (
          <li
            key={f.name}
            className="list-row file-list-item group items-center border-b border-base-300/50 px-4 py-2.5 transition-colors last:border-b-0 hover:bg-primary/5"
          >
            <span
              className="w-10 text-xs text-base-content/35"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="truncate text-sm tracking-tight text-base-content/80 transition-colors group-hover:text-base-content">
                {f.name.replace(/\.mp3$/i, "")}
              </span>
              <span className="rounded border border-primary/25 bg-primary/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-primary">
                MP3
              </span>
            </div>
            <span
              className="w-24 text-right text-[10px] tracking-[0.16em] text-base-content/45"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              {formatFileSize(f.size)}
            </span>
            <div className="w-8 flex justify-end">
              <button
                onClick={() => onRemove(f.name)}
                className="btn btn-ghost btn-xs btn-circle text-base-content/35 transition-colors hover:bg-error/10 hover:text-error"
                aria-label={`Remove ${f.name}`}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
