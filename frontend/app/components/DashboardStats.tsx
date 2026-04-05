"use client";

import { SongResult } from "../lib/types";
import { pct } from "../lib/constants";

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
    <div className="stats stats-vertical lg:stats-horizontal shadow w-full animate-fade-up">
      <div className="stat">
        <div className="stat-title">Total Processed</div>
        <div className="stat-value text-primary">{results.length}</div>
        <div className="stat-desc">
          {errorCount > 0 ? `${errorCount} FAILED` : "ALL OK"}
        </div>
      </div>

      <div className="stat">
        <div className="stat-title">Detect Classes</div>
        <div className="stat-value text-secondary">{genreCount}</div>
        <div className="stat-desc">CLASSES FOUND</div>
      </div>

      <div className="stat">
        <div className="stat-title">Model Conf.</div>
        <div className="stat-value text-accent">{pct(avgConfidence)}</div>
        <div className="stat-desc">MEAN PROBABILITY</div>
      </div>

      {topGenre && (
        <div className="stat">
          <div className="stat-title">Primary Cluster</div>
          <div className="stat-value uppercase">{topGenre}</div>
          <div className="stat-desc">DOMINANT CATEGORY</div>
        </div>
      )}
    </div>
  );
}
