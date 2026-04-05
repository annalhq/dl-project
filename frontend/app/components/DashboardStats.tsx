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
    <div className="stats stats-horizontal w-full shadow-sm bg-base-100 border border-base-content/10 animate-fade-up rounded-md">
      <div className="stat px-6 py-5">
        <div className="stat-title font-mono text-[10px] tracking-widest uppercase opacity-70">Total Processed</div>
        <div className="stat-value text-3xl mt-1 tracking-tighter">{results.length}</div>
        <div className="stat-desc font-mono text-[9px] uppercase tracking-wider mt-1 opacity-50">
          {errorCount > 0 ? `${errorCount} FAILED` : "ALL OK"}
        </div>
      </div>

      <div className="stat px-6 py-5 border-l border-base-content/5">
        <div className="stat-title font-mono text-[10px] tracking-widest uppercase opacity-70">Detect Classes</div>
        <div className="stat-value text-3xl mt-1 tracking-tighter">{genreCount}</div>
        <div className="stat-desc font-mono text-[9px] uppercase tracking-wider mt-1 opacity-50">CLASSES FOUND</div>
      </div>

      <div className="stat px-6 py-5 border-l border-base-content/5">
        <div className="stat-title font-mono text-[10px] tracking-widest uppercase opacity-70">Model Conf.</div>
        <div className="mt-1 flex items-center gap-3">
          <div className="stat-value text-3xl tracking-tighter">{pct(avgConfidence)}</div>
        </div>
        <div className="stat-desc font-mono text-[9px] uppercase tracking-wider mt-1 opacity-50">MEAN PROBABILITY</div>
      </div>

      {topGenre && (
        <div className="stat px-6 py-5 border-l border-base-content/5">
          <div className="stat-title font-mono text-[10px] tracking-widest uppercase opacity-70">Primary Cluster</div>
          <div className="stat-value text-3xl mt-1 tracking-tighter uppercase">{topGenre}</div>
          <div className="stat-desc font-mono text-[9px] uppercase tracking-wider mt-1 opacity-50">DOMINANT CATEGORY</div>
        </div>
      )}
    </div>
  );
}
