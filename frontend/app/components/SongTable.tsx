"use client";

import { useState } from "react";
import { SongResult, SortField, SortDirection } from "../lib/types";
import { pct } from "../lib/constants";

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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <span className="opacity-20 ml-2">↕</span>;
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
    <div className="overflow-x-auto rounded-2xl border border-base-300/80 bg-base-100 animate-fade-up">
      <table className="table table-zebra w-full text-sm">
        <thead
          className="bg-base-200/65 text-[10px] uppercase tracking-[0.2em] text-base-content/60"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          <tr>
            <th className="w-12 font-semibold">IDX</th>
            <th
              className="cursor-pointer select-none hover:text-base-content transition-colors font-semibold"
              onClick={() => handleSort("filename")}
            >
              Identifier {getSortIcon("filename")}
            </th>
            <th
              className="cursor-pointer select-none hover:text-base-content transition-colors font-semibold"
              onClick={() => handleSort("genre")}
            >
              Class {getSortIcon("genre")}
            </th>
            <th
              className="cursor-pointer select-none hover:text-base-content transition-colors w-44 font-semibold"
              onClick={() => handleSort("confidence")}
            >
              Confidence {getSortIcon("confidence")}
            </th>
            <th className="font-semibold">Distributions (Top 3)</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const topProbs = getTopProbs(r);

            return (
              <tr
                key={r.filename}
                className="group border-base-content/5 hover:bg-primary/5"
              >
                <td
                  className="text-[10px] text-base-content/40"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {(i + 1).toString().padStart(3, "0")}
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-[13px] truncate max-w-[200px] text-base-content/90">
                      {r.filename.replace(/\.mp3$/i, "")}
                    </span>
                    {r.error && (
                      <span
                        className="badge badge-error badge-soft badge-sm tracking-[0.15em]"
                        style={{ fontFamily: "var(--font-jetbrains)" }}
                      >
                        ERROR
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  {r.genre ? (
                    <span
                      className="badge badge-outline border-primary/30 bg-primary/5 text-[10px] uppercase tracking-[0.16em] text-primary"
                      style={{ fontFamily: "var(--font-jetbrains)" }}
                    >
                      {r.genre}
                    </span>
                  ) : (
                    <span className="text-error text-xs">—</span>
                  )}
                </td>
                <td
                  className="text-xs"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {r.confidence != null ? (
                    <div className="flex items-center gap-3">
                      <progress
                        className="progress progress-primary w-20"
                        value={Math.round(r.confidence * 100)}
                        max="100"
                      ></progress>
                      <span className="w-8 text-[10px] tracking-[0.16em] text-base-content/80">
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
                        className="tooltip tooltip-bottom tooltip-info"
                        data-tip={`${g}: ${pct(v)}`}
                      >
                        <div
                          className="flex flex-col items-start text-[10px] uppercase tracking-[0.15em] opacity-75 transition-opacity group-hover:opacity-100"
                          style={{ fontFamily: "var(--font-jetbrains)" }}
                        >
                          <span className="text-base-content/80 font-medium">
                            {g}
                          </span>
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
