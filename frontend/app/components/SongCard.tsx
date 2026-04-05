"use client";

import { useState } from "react";
import { SongResult } from "../lib/types";
import { pct, GENRE_COLORS, GENRES } from "../lib/constants";

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
            <div className="w-8 h-8 rounded bg-error/10 text-error flex items-center justify-center flex-shrink-0">
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
      className="card card-border bg-base-100 shadow-sm card-hover-lift animate-fade-up"
      style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
    >
      <div className="card-body p-4 gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded bg-base-content/5 text-base-content/50 flex items-center justify-center flex-shrink-0">
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
                className="font-medium text-sm truncate card-title tracking-tight"
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
            className="genre-badge flex-shrink-0"
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
            <span className="font-semibold text-base-content">
              {pct(result.confidence!)}
            </span>
          </div>
          <progress
            className="progress progress-neutral w-full bg-base-content/10 h-1"
            value={Math.round(result.confidence! * 100)}
            max="100"
          ></progress>
        </div>

        {/* Collapse for probabilities */}
        <div className="collapse collapse-arrow bg-transparent border border-base-content/5 rounded-md mt-1">
          <input
            type="checkbox"
            checked={expanded}
            onChange={() => setExpanded(!expanded)}
          />
          <div className="collapse-title font-mono text-xs uppercase tracking-widest py-2 px-3 min-h-0 text-base-content/70">
            Distributions
          </div>
          <div className="collapse-content px-3">
            <div className="space-y-2 pt-1 pb-2">
              {sortedProbs.map(([g, v]) => (
                <div
                  key={g}
                  className="flex items-center gap-2 font-mono text-xs"
                >
                  <span className="w-[72px] text-right uppercase text-base-content/65 tracking-widest text-xs">
                    {g}
                  </span>
                  <progress
                    className={`progress w-full h-1 bg-base-content/10 ${
                      g === result.genre ? "progress-neutral" : "opacity-30"
                    }`}
                    value={Math.round(v * 100)}
                    max="100"
                  ></progress>
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
