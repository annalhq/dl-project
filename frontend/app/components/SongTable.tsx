"use client";

import { useState } from "react";
import { SongResult, SortField, SortDirection } from "../lib/types";
import { pct, GENRE_EMOJI, GENRE_COLORS } from "../lib/constants";

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
      return <span className="text-base-content/20 ml-1">↕</span>;
    return (
      <span className="text-primary ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
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
      <table className="table table-zebra table-sm">
        <thead>
          <tr>
            <th className="w-10">#</th>
            <th
              className="cursor-pointer select-none hover:text-primary transition-colors"
              onClick={() => handleSort("filename")}
            >
              Filename <SortIcon field="filename" />
            </th>
            <th
              className="cursor-pointer select-none hover:text-primary transition-colors"
              onClick={() => handleSort("genre")}
            >
              Genre <SortIcon field="genre" />
            </th>
            <th
              className="cursor-pointer select-none hover:text-primary transition-colors w-40"
              onClick={() => handleSort("confidence")}
            >
              Confidence <SortIcon field="confidence" />
            </th>
            <th>Top 3 Probabilities</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const genreColor = r.genre ? GENRE_COLORS[r.genre] : null;
            const topProbs = getTopProbs(r);

            return (
              <tr key={r.filename} className="hover">
                <td className="text-base-content/40 font-mono text-xs">
                  {i + 1}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate max-w-[200px]">
                      {r.filename.replace(/\.mp3$/i, "")}
                    </span>
                    {r.error && (
                      <span className="badge badge-error badge-xs">Error</span>
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
                      {GENRE_EMOJI[r.genre]} {r.genre}
                    </span>
                  ) : (
                    <span className="text-error text-xs">—</span>
                  )}
                </td>
                <td>
                  {r.confidence != null ? (
                    <div className="flex items-center gap-2">
                      <progress
                        className="progress progress-primary w-20"
                        value={Math.round(r.confidence * 100)}
                        max="100"
                      ></progress>
                      <span className="text-xs font-semibold text-primary">
                        {pct(r.confidence)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-base-content/30">—</span>
                  )}
                </td>
                <td>
                  <div className="flex gap-3">
                    {topProbs.map(([g, v]) => (
                      <div
                        key={g}
                        className="tooltip tooltip-bottom"
                        data-tip={`${g}: ${pct(v)}`}
                      >
                        <span className="text-xs text-base-content/60 capitalize">
                          {GENRE_EMOJI[g]} {pct(v)}
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
