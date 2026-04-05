"use client";

import { useState } from "react";
import { SongResult } from "../lib/types";
import { pct, GENRE_COLORS } from "../lib/constants";

interface SongCardProps {
  result: SongResult;
  index: number;
}

export default function SongCard({ result, index }: SongCardProps) {
  const [expanded, setExpanded] = useState(false);
  const name = result.filename.replace(/\.mp3$/i, "");

  if (result.error) {
    return (
      <div
        className="card card-border bg-base-100 shadow-sm card-hover-lift animate-fade-up"
        style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
      >
        <div className="card-body p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-error/10 text-error flex items-center justify-center shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{name}</p>
              <p className="text-xs text-error mt-0.5 opacity-80">
                {result.error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const genreColor = GENRE_COLORS[result.genre!] ?? {
    bg: "transparent",
    text: "#e5e5e5",
    border: "#262626",
  };

  const sortedProbs = result.probabilities
    ? Object.entries(result.probabilities).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div
      className="card card-border bg-base-100 shadow-sm card-hover-lift animate-fade-up overflow-hidden"
      style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-primary/70 via-secondary/60 to-accent/70" />
      <div className="card-body p-4 gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-base-content/6 text-base-content/65 flex items-center justify-center shrink-0 border border-base-content/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19.5V15m6 4.5V15M9 15v-3.75a3 3 0 013-3v0a3 3 0 013 3V15M9 15h6"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p
                className="font-semibold text-[15px] truncate card-title tracking-tight"
                title={name}
              >
                {name}
              </p>
              <p className="font-mono text-xs uppercase tracking-widest text-base-content/60 mt-1">
                {result.filename}
              </p>
            </div>
          </div>
          <span
            className="genre-badge shrink-0"
            style={{
              backgroundColor: genreColor.bg,
              color: genreColor.text,
              border: `1px solid ${genreColor.border}`,
            }}
          >
            {result.genre}
          </span>
        </div>

        {/* Confidence bar */}
        <div>
          <div className="flex justify-between font-mono text-xs uppercase tracking-widest mb-1.5 w-full">
            <span className="text-base-content/65">Confidence</span>
            <span className="font-semibold text-base-content tabular-nums">
              {pct(result.confidence!)}
            </span>
          </div>
          <div className="relative h-1.5 w-full rounded-full bg-base-content/10 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-base-content/60"
              style={{ width: `${Math.round(result.confidence! * 100)}%` }}
            />
          </div>
        </div>

        {/* Collapse for probabilities */}
        <div className="collapse collapse-arrow bg-base-200/40 border border-base-content/8 rounded-lg mt-1">
          <input
            type="checkbox"
            checked={expanded}
            onChange={() => setExpanded(!expanded)}
          />
          <div className="collapse-title font-mono text-xs uppercase tracking-widest py-2.5 px-3 min-h-0 text-base-content/70">
            Distributions
          </div>
          <div className="collapse-content px-3">
            <div className="space-y-2 pt-1 pb-2">
              {sortedProbs.map(([g, v]) => (
                <div
                  key={g}
                  className="flex items-center gap-2 font-mono text-xs"
                >
                  <span className="w-18 text-right uppercase text-base-content/65 tracking-widest text-xs">
                    {g}
                  </span>
                  <div className="relative h-1 w-full rounded-full bg-base-content/10 overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full ${
                        g === result.genre
                          ? "bg-base-content/60"
                          : "bg-base-content/30"
                      }`}
                      style={{ width: `${Math.round(v * 100)}%` }}
                    />
                  </div>
                  <span
                    className={`w-10 text-right tracking-widest text-xs ${
                      g === result.genre
                        ? "text-base-content font-semibold"
                        : "text-base-content/55"
                    }`}
                  >
                    {pct(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
