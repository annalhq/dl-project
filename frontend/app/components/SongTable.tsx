"use client";

import { useState } from "react";
import { SongResult, SortField, SortDirection } from "../lib/types";
import { pct, GENRE_COLORS } from "../lib/constants";

interface SongTableProps {
  results: SongResult[];
}

export default function SongTable({ results }: SongTableProps) {
  const [sortField, setSortField] = useState<SortField>("filename");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = [...results].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortField) {
      case "filename":
        return dir * a.filename.localeCompare(b.filename);
      case "genre":
        return dir * (a.genre ?? "").localeCompare(b.genre ?? "");
      case "confidence":
        return dir * ((a.confidence ?? 0) - (b.confidence ?? 0));
      default:
        return 0;
    }
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    const isActive = sortField === field;
    return (
      <span className={`ml-1 inline-flex transition-all ${isActive ? "text-primary" : "text-base-content/20"}`}>
        {isActive ? (
          sortDir === "asc" ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M11.78 9.78a.75.75 0 0 1-1.06 0L8 7.06 5.28 9.78a.75.75 0 0 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          )
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M5.22 10.22a.75.75 0 0 1 1.06 0L8 11.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 0 1 0-1.06ZM10.78 5.78a.75.75 0 0 1-1.06 0L8 4.06 6.28 5.78a.75.75 0 0 1-1.06-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
          </svg>
        )}
      </span>
    );
  };

  const getTopProbs = (result: SongResult) => {
    if (!result.probabilities) return [];
    return Object.entries(result.probabilities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        {/* Head */}
        <thead>
          <tr className="border-b border-base-content/10 text-xs uppercase tracking-wider">
            <th className="w-12 font-medium text-base-content/40">#</th>
            <th
              className="font-medium text-base-content/50 cursor-pointer select-none hover:text-base-content transition-colors"
              onClick={() => handleSort("filename")}
            >
              <span className="flex items-center">
                File
                <SortIcon field="filename" />
              </span>
            </th>
            <th
              className="w-32 font-medium text-base-content/50 cursor-pointer select-none hover:text-base-content transition-colors"
              onClick={() => handleSort("genre")}
            >
              <span className="flex items-center">
                Genre
                <SortIcon field="genre" />
              </span>
            </th>
            <th
              className="w-44 font-medium text-base-content/50 cursor-pointer select-none hover:text-base-content transition-colors"
              onClick={() => handleSort("confidence")}
            >
              <span className="flex items-center">
                Confidence
                <SortIcon field="confidence" />
              </span>
            </th>
            <th className="w-64 font-medium text-base-content/40">Top 3 Predictions</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {sorted.map((r, i) => {
            const genreColor = r.genre ? GENRE_COLORS[r.genre] : null;
            const topProbs = getTopProbs(r);
            const confPct = r.confidence ? Math.round(r.confidence * 100) : 0;

            return (
              <tr
                key={r.filename}
                className="hover border-b border-base-content/5"
              >
                {/* Index */}
                <td className="font-mono text-xs text-base-content/35 tabular-nums font-medium">
                  {(i + 1).toString().padStart(2, "0")}
                </td>

                {/* Filename */}
                <td>
                  <div className="flex items-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0 text-base-content/25">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V4.103" />
                    </svg>
                    <span className="text-sm font-medium text-base-content/80 truncate max-w-56">
                      {r.filename.replace(/\.mp3$/i, "")}
                    </span>
                    {r.error && (
                      <span className="badge badge-xs badge-error badge-outline">ERR</span>
                    )}
                  </div>
                </td>

                {/* Genre */}
                <td>
                  {r.genre ? (
                    <span
                      className="inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                      style={{
                        backgroundColor: genreColor?.bg,
                        color: genreColor?.text,
                        border: `1px solid ${genreColor?.border}`,
                      }}
                    >
                      {r.genre}
                    </span>
                  ) : (
                    <span className="text-base-content/20 text-xs">—</span>
                  )}
                </td>

                {/* Confidence */}
                <td>
                  {r.confidence != null ? (
                    <div className="flex items-center gap-3">
                      <progress
                        className={`progress w-20 h-1.5 ${confPct >= 80 ? "progress-success" : confPct >= 50 ? "progress-warning" : "progress-error"}`}
                        value={confPct}
                        max="100"
                      />
                      <span className="font-mono text-xs tabular-nums text-base-content/60 font-medium w-12">
                        {pct(r.confidence)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-base-content/20 text-xs">—</span>
                  )}
                </td>

                {/* Top 3 */}
                <td>
                  <div className="flex items-center gap-2">
                    {topProbs.map(([g, v], j) => (
                      <div
                        key={g}
                        className={`inline-flex items-center gap-1.5 rounded-md border border-base-content/8 bg-base-200/50 px-2 py-1 transition-opacity ${j > 0 ? "opacity-50" : "opacity-80"}`}
                      >
                        <span className="font-mono text-[10px] uppercase tracking-wider text-base-content/60 font-medium">
                          {g}
                        </span>
                        <span className="font-mono text-[10px] tabular-nums text-base-content/40">
                          {pct(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
