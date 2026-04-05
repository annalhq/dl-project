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
      sub: errorCount > 0 ? `${errorCount} failed` : "All successful",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
        </svg>
      ),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Genre Classes",
      value: String(genreCount),
      sub: "Detected clusters",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
        </svg>
      ),
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      label: "Avg. Confidence",
      value: pct(avgConfidence),
      sub: avgConfidence >= 0.8 ? "High certainty" : avgConfidence >= 0.5 ? "Moderate" : "Low certainty",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      sub: topGenre ? `Top: ${topGenre}` : "No dominant genre",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <section className="animate-fade-up">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="card bg-base-100 border border-base-content/8 hover:border-base-content/15 transition-colors shadow-sm"
          >
            <div className="card-body p-5 gap-3">
              {/* Icon + label */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-base-content/45">
                  {item.label}
                </span>
                <div className={`w-9 h-9 rounded-lg ${item.bgColor} ${item.color} flex items-center justify-center`}>
                  {item.icon}
                </div>
              </div>

              {/* Value */}
              <p className="text-3xl font-bold tracking-tight tabular-nums text-base-content">
                {item.value}
              </p>

              {/* Subtitle */}
              <p className="text-xs text-base-content/40 font-medium">
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
