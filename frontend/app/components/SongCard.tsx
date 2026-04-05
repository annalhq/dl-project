"use client";

import { useState } from "react";
import { SongResult } from "../lib/types";
import { pct, GENRE_EMOJI, GENRE_COLORS, GENRES } from "../lib/constants";

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
            <span className="text-2xl">⚠️</span>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{name}</p>
              <p className="text-xs text-error mt-0.5">{result.error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const genreColor = GENRE_COLORS[result.genre!] ?? {
    bg: "#f1f5f9",
    text: "#334155",
    border: "#cbd5e1",
  };

  const sortedProbs = result.probabilities
    ? Object.entries(result.probabilities).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div
      className="card card-border bg-base-100 shadow-sm card-hover-lift animate-fade-up"
      style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
    >
      <div className="card-body p-4 gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl flex-shrink-0">
              {GENRE_EMOJI[result.genre!] ?? "🎵"}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate card-title" title={name}>
                {name}
              </p>
              <p className="text-xs text-base-content/40 mt-0.5">{result.filename}</p>
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
            {GENRE_EMOJI[result.genre!]} {result.genre}
          </span>
        </div>

        {/* Confidence bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-base-content/50">Confidence</span>
            <span className="font-semibold text-primary">{pct(result.confidence!)}</span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={Math.round(result.confidence! * 100)}
            max="100"
          ></progress>
        </div>

        {/* Collapse for probabilities */}
        <div className="collapse collapse-arrow bg-base-200/50 rounded-lg">
          <input
            type="checkbox"
            checked={expanded}
            onChange={() => setExpanded(!expanded)}
          />
          <div className="collapse-title text-xs font-medium py-2 min-h-0">
            All probabilities
          </div>
          <div className="collapse-content px-3">
            <div className="space-y-1.5 pt-1 pb-2">
              {sortedProbs.map(([g, v]) => (
                <div key={g} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-right capitalize text-base-content/60 font-medium">
                    {g}
                  </span>
                  <progress
                    className={`progress w-full ${
                      g === result.genre ? "progress-primary" : "progress-accent"
                    }`}
                    value={Math.round(v * 100)}
                    max="100"
                  ></progress>
                  <span
                    className={`w-12 text-right ${
                      g === result.genre
                        ? "text-primary font-semibold"
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
