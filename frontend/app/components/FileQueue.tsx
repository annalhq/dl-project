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
      <div className="stats stats-horizontal w-full shadow-sm mb-4">
        <div className="stat py-3 px-5">
          <div className="stat-title text-xs">Files Selected</div>
          <div className="stat-value text-lg text-primary">{files.length}</div>
        </div>
        <div className="stat py-3 px-5">
          <div className="stat-title text-xs">Total Size</div>
          <div className="stat-value text-lg text-secondary">
            {formatFileSize(totalSize)}
          </div>
        </div>
        <div className="stat py-3 px-5 flex items-center">
          <button
            onClick={onClearAll}
            className="btn btn-ghost btn-sm text-error"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022 1.005 11.36A2.75 2.75 0 0 0 7.761 20h4.478a2.75 2.75 0 0 0 2.742-2.689l1.005-11.36.149.022a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
            </svg>
            Clear All
          </button>
        </div>
      </div>

      {/* File list */}
      <ul className="list bg-base-100 rounded-box shadow-sm">
        <li className="list-row py-2 px-4 text-xs font-semibold text-base-content/50 uppercase tracking-wider">
          <span></span>
          <span>File Name</span>
          <span>Size</span>
          <span></span>
        </li>
        {files.map((f, i) => (
          <li key={f.name} className="list-row file-list-item items-center py-2 px-4">
            <span className="text-base-content/30 text-sm font-mono w-6">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium truncate">
                {f.name.replace(/\.mp3$/i, "")}
              </span>
              <span className="badge badge-ghost badge-xs">.mp3</span>
            </div>
            <span className="text-xs text-base-content/50">
              {formatFileSize(f.size)}
            </span>
            <button
              onClick={() => onRemove(f.name)}
              className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-error"
              aria-label={`Remove ${f.name}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
