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
    if (sortField !== field)
      return <span className="opacity-20 ml-2">↕</span>;
    return (
      <span className="text-base-content ml-2">{sortDir === "asc" ? "↑" : "↓"}</span>
    );
  };

  const getTopProbs = (result: SongResult) => {
    if (!result.probabilities) return [];
    return Object.entries(result.probabilities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  return (
    <div className="overflow-x-auto animate-fade-up">
      <table className="table table-sm text-sm">
        <thead className="font-mono text-[10px] uppercase tracking-widest text-base-content/40">
          <tr>
            <th className="w-12 font-normal pb-3">IDX</th>
            <th
              className="cursor-pointer select-none hover:text-base-content transition-colors font-normal pb-3"
              onClick={() => handleSort("filename")}
            >
              Identifier <SortIcon field="filename" />
            </th>
            <th
              className="cursor-pointer select-none hover:text-base-content transition-colors font-normal pb-3"
              onClick={() => handleSort("genre")}
            >
              Class <SortIcon field="genre" />
            </th>
            <th
              className="cursor-pointer select-none hover:text-base-content transition-colors w-40 font-normal pb-3"
              onClick={() => handleSort("confidence")}
            >
              Confidence <SortIcon field="confidence" />
            </th>
            <th className="font-normal pb-3">Distributions (Top 3)</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const genreColor = r.genre ? GENRE_COLORS[r.genre] : null;
            const topProbs = getTopProbs(r);

            return (
              <tr key={r.filename} className="hover:bg-base-content/5 transition-colors border-b border-base-content/5 group">
                <td className="text-base-content/40 font-mono text-[10px]">
                  {(i + 1).toString().padStart(3, "0")}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-[13px] truncate max-w-[200px] text-base-content/90">
                      {r.filename.replace(/\.mp3$/i, "")}
                    </span>
                    {r.error && (
                      <span className="border border-error/20 bg-error/10 text-error px-1.5 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase">Error</span>
                    )}
                  </div>
                </td>
                <td>
                  {r.genre ? (
                    <span
                      className="genre-badge"
                      style={{
                        backgroundColor: genreColor?.bg,
                        color: genreColor?.text,
                        border: `1px solid ${genreColor?.border}`,
                      }}
                    >
                      {r.genre}
                    </span>
                  ) : (
                    <span className="text-error text-xs">—</span>
                  )}
                </td>
                <td className="font-mono text-xs">
                  {r.confidence != null ? (
                    <div className="flex items-center gap-3">
                      <progress
                        className="progress progress-neutral w-20 h-1 bg-base-content/10"
                        value={Math.round(r.confidence * 100)}
                        max="100"
                      ></progress>
                      <span className="text-[10px] tracking-widest text-base-content/80 w-8">
                        {pct(r.confidence)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-base-content/30">—</span>
                  )}
                </td>
                <td>
                  <div className="flex gap-4">
                    {topProbs.map(([g, v]) => (
                      <div
                        key={g}
                        className="tooltip tooltip-bottom tooltip-neutral"
                        data-tip={`${g}: ${pct(v)}`}
                      >
                        <div className="flex flex-col text-[10px] font-mono uppercase tracking-widest items-start transition-opacity opacity-70 group-hover:opacity-100">
                           <span className="text-base-content/80 font-medium">{g}</span>
                           <span className="text-base-content/40">{pct(v)}</span>
                        </div>
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
