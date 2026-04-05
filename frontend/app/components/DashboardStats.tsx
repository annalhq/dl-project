"use client";

import { SongResult } from "../lib/types";
import { pct } from "../lib/constants";

interface DashboardStatsProps {
  results: SongResult[];
  genreCount: number;
  topGenre: string | null;
}

export default function DashboardStats({
  results,
  genreCount,
  topGenre,
}: DashboardStatsProps) {
  const successful = results.filter((r) => r.genre && !r.error);
  const avgConfidence =
    successful.length > 0
      ? successful.reduce((acc, r) => acc + (r.confidence ?? 0), 0) /
        successful.length
      : 0;
  const errorCount = results.filter((r) => r.error).length;

  return (
    <div className="stats stats-vertical w-full animate-fade-up rounded-2xl border border-base-300/80 bg-base-100 shadow-sm lg:stats-horizontal">
      <div className="stat">
        <div className="stat-title text-base-content/60">Total Processed</div>
        <div className="stat-value text-primary">{results.length}</div>
        <div
          className="stat-desc font-medium text-base-content/55"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          {errorCount > 0 ? `${errorCount} FAILED` : "ALL OK"}
        </div>
      </div>

      <div className="stat">
        <div className="stat-title text-base-content/60">Detected Classes</div>
        <div className="stat-value text-secondary">{genreCount}</div>
        <div
          className="stat-desc text-base-content/55"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          CLASSES FOUND
        </div>
      </div>

      <div className="stat">
        <div className="stat-title text-base-content/60">Model Confidence</div>
        <div className="stat-value text-accent">{pct(avgConfidence)}</div>
        <div
          className="stat-desc text-base-content/55"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          MEAN PROBABILITY
        </div>
      </div>

      {topGenre && (
        <div className="stat">
          <div className="stat-title text-base-content/60">Primary Cluster</div>
          <div className="stat-value uppercase">{topGenre}</div>
          <div
            className="stat-desc text-base-content/55"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            DOMINANT CATEGORY
          </div>
        </div>
      )}
    </div>
  );
}
