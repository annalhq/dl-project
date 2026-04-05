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

  const SortIcon = ({ field }: { field: SortField }) => (
    <span
      className={`ml-1.5 text-xs transition-opacity ${sortField === field ? "opacity-70" : "opacity-20"}`}
    >
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  const getTopProbs = (result: SongResult) => {
    if (!result.probabilities) return [];
    return Object.entries(result.probabilities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  const cols: { label: string; field?: SortField; className?: string }[] = [
    { label: "#", className: "w-10" },
    { label: "File", field: "filename" },
    { label: "Genre", field: "genre", className: "w-36" },
    { label: "Confidence", field: "confidence", className: "w-44" },
    { label: "Top 3", className: "w-56" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {/* Head */}
        <thead>
          <tr className="border-b border-base-content/8">
            {cols.map(({ label, field, className }) => (
              <th
                key={label}
                className={[
                  "pb-2.5 pt-1 text-left font-mono text-xs uppercase tracking-widest text-base-content/55 font-normal",
                  field
                    ? "cursor-pointer select-none hover:text-base-content/60 transition-colors"
                    : "",
                  className ?? "",
                ].join(" ")}
                onClick={() => field && handleSort(field)}
              >
                {label}
                {field && <SortIcon field={field} />}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {sorted.map((r, i) => {
            const genreColor = r.genre ? GENRE_COLORS[r.genre] : null;
            const topProbs = getTopProbs(r);

            return (
              <tr
                key={r.filename}
                className="group border-b border-base-content/5 hover:bg-base-content/2.5 transition-colors"
              >
                {/* Index */}
                <td className="py-3 font-mono text-xs text-base-content/55 tabular-nums">
                  {(i + 1).toString().padStart(2, "0")}
                </td>

                {/* Filename */}
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-base-content/85 truncate max-w-[220px] tracking-tight">
                      {r.filename.replace(/\.mp3$/i, "")}
                    </span>
                    {r.error && (
                      <span className="shrink-0 rounded px-1.5 py-0.5 font-mono text-xs uppercase tracking-widest border border-error/20 bg-error/8 text-error/75">
                        err
                      </span>
                    )}
                  </div>
                </td>

                {/* Genre badge */}
                <td className="py-3 pr-4">
                  {r.genre ? (
                    <span
                      className="inline-block rounded px-2 py-0.5 text-[11px] font-medium tracking-wide"
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

                {/* Confidence bar */}
                <td className="py-3 pr-4">
                  {r.confidence != null ? (
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-1 w-24 overflow-hidden rounded-full bg-base-content/8">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-base-content/40 transition-all"
                          style={{
                            width: `${Math.round(r.confidence * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="font-mono text-[11px] tabular-nums text-base-content/50 w-8">
                        {pct(r.confidence)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-base-content/20 text-xs">—</span>
                  )}
                </td>

                {/* Top 3 distributions */}
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    {topProbs.map(([g, v]) => (
                      <div
                        key={g}
                        className="flex flex-col gap-0.5 opacity-50 group-hover:opacity-90 transition-opacity"
                      >
                        <span className="font-mono text-xs uppercase tracking-widest text-base-content/75">
                          {g}
                        </span>
                        <span className="font-mono text-xs tabular-nums text-base-content/60">
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
