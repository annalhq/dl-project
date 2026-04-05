"use client";

import { SongResult } from "../lib/types";
import { pct, GENRE_EMOJI } from "../lib/constants";

interface DashboardStatsProps {
  results: SongResult[];
  genreCount: number;
  topGenre: string | null;
}

export default function DashboardStats({ results, genreCount, topGenre }: DashboardStatsProps) {
  const successful = results.filter((r) => r.genre && !r.error);
  const avgConfidence =
    successful.length > 0
      ? successful.reduce((acc, r) => acc + (r.confidence ?? 0), 0) / successful.length
      : 0;
  const errorCount = results.filter((r) => r.error).length;

  return (
    <div className="stats stats-horizontal w-full shadow-sm bg-base-100 animate-fade-up">
      <div className="stat">
        <div className="stat-figure text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .456.122Z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="stat-title">Total Songs</div>
        <div className="stat-value text-primary">{results.length}</div>
        <div className="stat-desc">
          {errorCount > 0 ? `${errorCount} failed` : "All processed"}
        </div>
      </div>

      <div className="stat">
        <div className="stat-figure text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3V6ZM3 15.75a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.25Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3v-2.25Z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="stat-title">Genres Found</div>
        <div className="stat-value text-secondary">{genreCount}</div>
        <div className="stat-desc">out of 9 possible</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-accent">
          <div
            className="radial-progress text-accent text-xs font-bold"
            style={{
              "--value": Math.round(avgConfidence * 100),
              "--size": "3.5rem",
              "--thickness": "0.35rem",
            } as React.CSSProperties}
            role="progressbar"
            aria-valuenow={Math.round(avgConfidence * 100)}
          >
            {pct(avgConfidence)}
          </div>
        </div>
        <div className="stat-title">Avg Confidence</div>
        <div className="stat-value text-accent">{pct(avgConfidence)}</div>
        <div className="stat-desc">across all songs</div>
      </div>

      {topGenre && (
        <div className="stat">
          <div className="stat-figure text-3xl">
            {GENRE_EMOJI[topGenre]}
          </div>
          <div className="stat-title">Top Genre</div>
          <div className="stat-value capitalize text-base-content">{topGenre}</div>
          <div className="stat-desc">most classified</div>
        </div>
      )}
    </div>
  );
}
