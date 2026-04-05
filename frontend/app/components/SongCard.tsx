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
        className="card card-border surface-card card-hover-lift animate-fade-up"
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
    bg: "#eef4ff",
    text: "#2b4f94",
    border: "#c9dafc",
  };

  const sortedProbs = result.probabilities
    ? Object.entries(result.probabilities).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div
      className="card card-border surface-card card-hover-lift animate-fade-up"
      style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
    >
      <div className="card-body p-4 gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
              <p
                className="mt-1 text-[10px] uppercase tracking-[0.16em] text-base-content/45"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
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
          <div
            className="mb-1.5 inline-flex w-full justify-between text-[10px] uppercase tracking-[0.18em]"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            <span className="text-base-content/50">Confidence</span>
            <span className="font-semibold text-primary">
              {pct(result.confidence!)}
            </span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={Math.round(result.confidence! * 100)}
            max="100"
          ></progress>
        </div>

        {/* Collapse for probabilities */}
        <div className="collapse collapse-arrow mt-2 border border-base-300/70 bg-base-200/60">
          <input
            type="checkbox"
            checked={expanded}
            onChange={() => setExpanded(!expanded)}
          />
          <div className="collapse-title text-sm font-semibold text-base-content/80">
            Distributions
          </div>
          <div className="collapse-content">
            <div className="space-y-2 pt-1 pb-2">
              {sortedProbs.map(([g, v]) => (
                <div
                  key={g}
                  className="flex items-center gap-2 text-xs"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  <span className="w-[72px] text-right text-[10px] uppercase tracking-[0.16em] text-base-content/50">
                    {g}
                  </span>
                  <progress
                    className={`progress w-full ${
                      g === result.genre ? "progress-primary" : ""
                    }`}
                    value={Math.round(v * 100)}
                    max="100"
                  ></progress>
                  <span
                    className={`w-10 text-right text-[10px] tracking-[0.16em] ${
                      g === result.genre
                        ? "text-base-content font-semibold"
                        : "text-base-content/40"
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
