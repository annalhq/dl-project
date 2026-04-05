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
  const successRate = results.length
    ? Math.round(((results.length - errorCount) / results.length) * 100)
    : 0;

  const stats = [
    {
      label: "Processed",
      value: String(results.length),
      helper: errorCount > 0 ? `${errorCount} failed` : "all successful",
      fill: Math.min(100, Math.round((results.length / 20) * 100)),
      detail: (
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-base-content/25" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-base-content/30">
            {results.length - errorCount} ok
          </span>
          {errorCount > 0 && (
            <>
              <span className="text-base-content/15">·</span>
              <span className="h-1.5 w-1.5 rounded-full bg-error/40" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-error/50">
                {errorCount} err
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      label: "Genre Classes",
      value: String(genreCount),
      helper: "detected clusters",
      fill: Math.min(100, Math.round((genreCount / 10) * 100)),
      detail: (
        <div className="flex gap-1">
          {Array.from({ length: Math.min(genreCount, 10) }).map((_, i) => (
            <div
              key={i}
              className="h-3 w-1 rounded-sm bg-base-content/20"
              style={{
                opacity: 0.15 + (i / Math.max(genreCount - 1, 1)) * 0.6,
              }}
            />
          ))}
          {genreCount > 10 && (
            <span className="font-mono text-[9px] text-base-content/25 self-end ml-0.5">
              +{genreCount - 10}
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Avg Confidence",
      value: pct(avgConfidence),
      helper: "mean probability",
      fill: Math.round(avgConfidence * 100),
      detail: (
        <div className="flex items-end gap-px h-3">
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
            <div
              key={i}
              className="w-2 rounded-sm transition-all duration-300"
              style={{
                height: `${20 + i * 16}%`,
                backgroundColor:
                  avgConfidence >= threshold
                    ? `rgba(var(--bc) / ${0.3 + i * 0.08})`
                    : `rgba(var(--bc) / 0.06)`,
              }}
            />
          ))}
          <span className="font-mono text-[9px] uppercase tracking-widest text-base-content/25 ml-1.5 mb-px">
            {avgConfidence >= 0.8
              ? "high"
              : avgConfidence >= 0.5
                ? "mid"
                : "low"}
          </span>
        </div>
      ),
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      helper: topGenre ? `top: ${topGenre}` : "no dominant genre",
      fill: successRate,
      detail: null,
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map((item) => (
          <article
            key={item.label}
            className="rounded-lg border border-base-content/8 px-5 py-4 flex flex-col gap-3"
          >
            <p className="font-mono text-[9px] uppercase tracking-widest text-base-content/30">
              {item.label}
            </p>

            <p className="text-2xl font-semibold tracking-tight tabular-nums text-base-content/85">
              {item.value}
            </p>

            <div className="flex flex-col gap-2 mt-auto">
              {item.detail ?? (
                <>
                  <div className="h-px w-full bg-base-content/6 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-base-content/25 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, item.fill)}%` }}
                    />
                  </div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-base-content/25">
                    {item.helper}
                  </p>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
