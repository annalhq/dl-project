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
        className="card bg-base-100 border border-error/20 shadow-sm animate-fade-up"
        style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
      >
        <div className="card-body p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-error">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-base-content/90 truncate">{name}</p>
              <p className="text-xs text-error/80 mt-0.5">{result.error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const genreColor = GENRE_COLORS[result.genre!] ?? {
    bg: "#1a1a2e",
    text: "#e5e5e5",
    border: "#333",
  };

  const confidence = result.confidence ?? 0;
  const confPct = Math.round(confidence * 100);

  const sortedProbs = result.probabilities
    ? Object.entries(result.probabilities).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div
      className="card bg-base-100 border border-base-content/8 shadow-sm card-hover-lift animate-fade-up overflow-hidden"
      style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${genreColor.border}, ${genreColor.text}40)`,
        }}
      />

      <div className="card-body p-5 gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Music icon */}
            <div className="w-10 h-10 rounded-xl bg-base-content/5 flex items-center justify-center shrink-0 border border-base-content/8">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-base-content/40">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V4.103" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-base-content/90 truncate leading-tight" title={name}>
                {name}
              </p>
              <p className="font-mono text-xs text-base-content/40 mt-1 truncate">
                {result.filename}
              </p>
            </div>
          </div>

          {/* Genre badge */}
          <span
            className="genre-badge shrink-0 text-xs"
            style={{
              backgroundColor: genreColor.bg,
              color: genreColor.text,
              border: `1px solid ${genreColor.border}`,
            }}
          >
            {result.genre}
          </span>
        </div>

        {/* Confidence section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-base-content/50 uppercase tracking-wider">
              Confidence
            </span>
            <span className="text-sm font-bold font-mono tabular-nums text-base-content">
              {pct(confidence)}
            </span>
          </div>
          <progress
            className={`progress w-full h-2 ${confPct >= 80 ? "progress-success" : confPct >= 50 ? "progress-warning" : "progress-error"}`}
            value={confPct}
            max="100"
          />
        </div>

        {/* Expandable probability distribution */}
        <div className="collapse collapse-arrow bg-base-200/30 border border-base-content/6 rounded-xl">
          <input
            type="checkbox"
            checked={expanded}
            onChange={() => setExpanded(!expanded)}
          />
          <div className="collapse-title text-xs font-medium uppercase tracking-wider text-base-content/50 py-3 px-4 min-h-0">
            Probability Distribution
          </div>
          <div className="collapse-content px-4">
            <div className="space-y-2.5 pt-1 pb-2">
              {sortedProbs.map(([g, v]) => {
                const isTop = g === result.genre;
                const barPct = Math.round(v * 100);
                return (
                  <div key={g} className="flex items-center gap-3">
                    <span className={`w-20 text-right text-xs font-mono uppercase tracking-wider ${isTop ? "text-base-content font-semibold" : "text-base-content/45"}`}>
                      {g}
                    </span>
                    <div className="flex-1 relative">
                      <progress
                        className={`progress w-full h-1.5 ${isTop ? "progress-primary" : "[--progress-color:oklch(50%_0.01_260)]"}`}
                        value={barPct}
                        max="100"
                      />
                    </div>
                    <span className={`w-12 text-right text-xs font-mono tabular-nums ${isTop ? "text-base-content font-bold" : "text-base-content/40"}`}>
                      {pct(v)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
