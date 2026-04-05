"use client";

import { formatFileSize } from "../lib/constants";

interface FileQueueProps {
  files: File[];
  onRemove: (name: string) => void;
  onClearAll: () => void;
}

export default function FileQueue({ files, onRemove, onClearAll }: FileQueueProps) {
  if (files.length === 0) return null;

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="animate-fade-up">
      {/* Stats bar */}
      <div className="stats stats-horizontal shadow w-full mb-6 relative">
        <div className="stat">
          <div className="stat-title">Files Selected</div>
          <div className="stat-value text-primary">{files.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Total Weight</div>
          <div className="stat-value text-secondary">
            {formatFileSize(totalSize)}
          </div>
        </div>
        <div className="stat place-items-end justify-center">
          <button
            onClick={onClearAll}
            className="btn btn-outline btn-error btn-sm font-mono text-[10px] tracking-widest uppercase"
          >
            Clear Selected
          </button>
        </div>
      </div>

      {/* File list */}
      <ul className="list bg-transparent border-t border-base-content/10">
        <li className="list-row py-3 px-4 text-[10px] font-mono font-medium text-base-content/40 uppercase tracking-widest border-b border-base-content/5 flex items-center">
          <span className="w-10">IDX</span>
          <span className="flex-1">Identifier</span>
          <span className="w-24 text-right">Size</span>
          <span className="w-8"></span>
        </li>
        {files.map((f, i) => (
          <li key={f.name} className="list-row file-list-item items-center py-2.5 px-4 border-b border-base-content/5 hover:bg-base-content/5 transition-colors group">
            <span className="text-base-content/30 text-xs font-mono w-10">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-sm tracking-tight text-base-content/80 group-hover:text-base-content transition-colors truncate">
                {f.name.replace(/\.mp3$/i, "")}
              </span>
              <span className="px-1.5 py-0.5 border border-base-content/10 text-base-content/40 rounded text-[9px] font-mono tracking-widest uppercase">
                MP3
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-base-content/40 w-24 text-right">
              {formatFileSize(f.size)}
            </span>
            <div className="w-8 flex justify-end">
              <button
                onClick={() => onRemove(f.name)}
                className="btn btn-ghost btn-xs btn-circle text-base-content/30 hover:text-error hover:bg-error/10 transition-colors"
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
