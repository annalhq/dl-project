"use client";

import { FileProgress, SongResult } from "../lib/types";
import { STEP_LABELS, STEP_ORDER } from "../lib/constants";

interface AnalyzingProgressProps {
  fileProgresses: Map<string, FileProgress>;
  totalFiles: number;
  completedResults: SongResult[];
}

export default function AnalyzingProgress({
  fileProgresses,
  totalFiles,
  completedResults,
}: AnalyzingProgressProps) {
  const completedCount = completedResults.length;
  const overallPct =
    totalFiles > 0 ? Math.round((completedCount / totalFiles) * 100) : 0;

  const entries = Array.from(fileProgresses.entries());
  const activeEntry = entries.find(
    ([, fp]) => fp.step !== "complete" && fp.step !== "error",
  );

  return (
    <div className="card bg-base-100 border border-base-content/10 shadow-xl animate-fade-up">
      <div className="card-body items-center text-center gap-8 py-12">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-base-content">
            Processing Pipeline
          </h2>
          <p className="text-sm text-base-content/50 font-mono">
            {completedCount} of {totalFiles} files complete
          </p>
        </div>

        {/* Progress ring */}
        <div className="relative">
          <div
            className="radial-progress text-primary font-semibold"
            style={
              {
                "--value": overallPct,
                "--size": "7rem",
                "--thickness": "4px",
              } as React.CSSProperties
            }
            role="progressbar"
            aria-valuenow={overallPct}
          >
            <div className="text-center">
              <span className="text-2xl font-mono font-bold text-base-content tabular-nums">
                {overallPct}
              </span>
              <span className="text-xs text-base-content/50">%</span>
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="w-full max-w-md">
          <progress
            className="progress progress-primary w-full h-2"
            value={overallPct}
            max="100"
          />
        </div>

        {/* Active file pipeline steps */}
        {activeEntry && (
          <div className="w-full max-w-lg mt-2">
            <div className="flex items-center gap-2 justify-center mb-5">
              <span className="loading loading-spinner loading-xs text-primary" />
              <p className="text-sm font-medium text-base-content/70 truncate">
                {activeEntry[0].replace(/\.mp3$/i, "")}
              </p>
            </div>
            <ul className="steps steps-horizontal w-full text-xs font-mono tracking-wide">
              {STEP_ORDER.map((step) => {
                const currentIdx = STEP_ORDER.indexOf(
                  activeEntry[1].step as (typeof STEP_ORDER)[number],
                );
                const stepIdx = STEP_ORDER.indexOf(step);
                const isActive = stepIdx <= currentIdx;
                return (
                  <li
                    key={step}
                    className={`step ${isActive ? "step-primary" : ""}`}
                    data-content={isActive ? "●" : "○"}
                  >
                    <span className={`text-[10px] uppercase tracking-wider ${isActive ? "text-base-content/80 font-medium" : "text-base-content/30"}`}>
                      {STEP_LABELS[step]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Completed files log */}
        {completedResults.length > 0 && (
          <>
            <div className="divider text-xs font-mono uppercase tracking-widest text-base-content/30 w-full mt-6">
              Processed Log
            </div>

            <div className="w-full max-w-lg space-y-1.5">
              {entries.map(([filename, fp]) => {
                const isDone = fp.step === "complete";
                const isError = fp.step === "error";
                const result = completedResults.find(
                  (r) => r.filename === filename,
                );

                return (
                  <div
                    key={filename}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ${
                      isDone
                        ? "bg-success/5 border border-success/10"
                        : isError
                          ? "bg-error/5 border border-error/10"
                          : "bg-base-200/50 border border-base-content/5"
                    }`}
                  >
                    {/* Status dot */}
                    {isDone ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-success shrink-0">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                      </svg>
                    ) : isError ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-error shrink-0">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="loading loading-spinner loading-xs text-primary shrink-0" />
                    )}

                    {/* Filename */}
                    <span className="truncate flex-1 font-medium text-base-content/70 text-left text-sm">
                      {filename.replace(/\.mp3$/i, "")}
                    </span>

                    {/* Result */}
                    {isDone && result?.genre ? (
                      <span className="badge badge-sm badge-primary badge-outline font-mono uppercase text-[10px] tracking-wider">
                        {result.genre}
                      </span>
                    ) : isError ? (
                      <span className="badge badge-sm badge-error badge-outline text-[10px]">ERROR</span>
                    ) : (
                      <span className="text-xs text-base-content/30 font-mono uppercase">
                        {STEP_LABELS[fp.step] || "Processing"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
