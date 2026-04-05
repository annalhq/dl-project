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
      <span className="text-primary ml-2">{sortDir === "asc" ? "↑" : "↓"}</span>
    );
  };

  const getTopProbs = (result: SongResult) => {
    if (!result.probabilities) return [];
    return Object.entries(result.probabilities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  return (
    <div className="overflow-x-auto animate-fade-up border border-base-content/10 rounded-md">
      <table className="table table-zebra w-full text-sm">
        <thead className="bg-base-200/50 font-mono text-[10px] uppercase tracking-widest text-base-content/60">
          <tr>
            <th className="w-12 font-semibold">IDX</th>
            <th
              className="cursor-pointer select-none hover:text-base-content transition-colors font-semibold"
              onClick={() => handleSort("filename")}
            >
              Identifier <SortIcon field="filename" />
            </th>
            <th
              className="cursor-pointer select-none hover:text-base-content transition-colors font-semibold"
              onClick={() => handleSort("genre")}
            >
              Class <SortIcon field="genre" />
            </th>
            <th
              className="cursor-pointer select-none hover:text-base-content transition-colors w-44 font-semibold"
              onClick={() => handleSort("confidence")}
            >
              Confidence <SortIcon field="confidence" />
            </th>
            <th className="font-semibold">Distributions (Top 3)</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const topProbs = getTopProbs(r);

            return (
              <tr key={r.filename} className="hover group border-base-content/5">
                <td className="text-base-content/40 font-mono text-[10px]">
                  {(i + 1).toString().padStart(3, "0")}
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-[13px] truncate max-w-[200px] text-base-content/90">
                      {r.filename.replace(/\.mp3$/i, "")}
                    </span>
                    {r.error && (
                      <span className="badge badge-error badge-sm font-mono tracking-widest">ERROR</span>
                    )}
                  </div>
                </td>
                <td>
                  {r.genre ? (
                    <span className="badge badge-outline font-mono text-[10px] tracking-widest uppercase">
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
                        className="progress progress-primary w-20"
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
                        className="tooltip tooltip-bottom tooltip-primary"
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
