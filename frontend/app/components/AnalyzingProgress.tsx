"use client";

import { FileProgress, SongResult } from "../lib/types";
import { STEP_LABELS, STEP_ORDER, GENRE_EMOJI, GENRE_COLORS } from "../lib/constants";

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
  const overallPct = totalFiles > 0 ? Math.round((completedCount / totalFiles) * 100) : 0;

  // Find current active file
  const entries = Array.from(fileProgresses.entries());
  const activeEntry = entries.find(
    ([, fp]) => fp.step !== "complete" && fp.step !== "error"
  );

  return (
    <div className="card card-border bg-base-100 shadow-sm animate-fade-up">
      <div className="card-body items-center text-center gap-6">
        <h2 className="card-title text-lg">Analyzing Your Music</h2>

        {/* Overall radial progress */}
        <div
          className="radial-progress text-primary font-bold"
          style={{
            "--value": overallPct,
            "--size": "7rem",
            "--thickness": "0.5rem",
          } as React.CSSProperties}
          role="progressbar"
          aria-valuenow={overallPct}
        >
          <span className="text-xl">{completedCount}/{totalFiles}</span>
        </div>
        <p className="text-sm text-base-content/50">
          {completedCount < totalFiles
            ? `Processing file ${completedCount + 1} of ${totalFiles}...`
            : "All files processed!"}
        </p>

        {/* Current file steps */}
        {activeEntry && (
          <div className="w-full max-w-lg">
            <p className="text-sm font-semibold mb-3 text-base-content/70">
              📄 {activeEntry[0].replace(/\.mp3$/i, "")}
            </p>
            <ul className="steps steps-horizontal w-full text-xs">
              {STEP_ORDER.map((step) => {
                const currentIdx = STEP_ORDER.indexOf(activeEntry[1].step as typeof STEP_ORDER[number]);
                const stepIdx = STEP_ORDER.indexOf(step);
                const isActive = stepIdx <= currentIdx;
                return (
                  <li
                    key={step}
                    className={`step ${isActive ? "step-primary" : ""}`}
                    data-content={stepIdx < currentIdx ? "✓" : stepIdx === currentIdx ? "●" : ""}
                  >
                    {STEP_LABELS[step]}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Divider */}
        {completedResults.length > 0 && (
          <div className="divider text-xs text-base-content/40 w-full">Completed</div>
        )}

        {/* Completed files timeline */}
        {completedResults.length > 0 && (
          <ul className="timeline timeline-vertical timeline-compact w-full max-w-lg">
            {entries.map(([filename, fp], i) => {
              const isDone = fp.step === "complete";
              const isError = fp.step === "error";
              const isProcessing = !isDone && !isError;
              const result = completedResults.find((r) => r.filename === filename);

              return (
                <li key={filename}>
                  {i > 0 && <hr className={isDone ? "bg-success" : isError ? "bg-error" : ""} />}
                  <div className="timeline-start text-xs text-base-content/60 truncate max-w-[140px]">
                    {filename.replace(/\.mp3$/i, "")}
                  </div>
                  <div className="timeline-middle">
                    {isDone ? (
                      <span className="text-success text-sm">✓</span>
                    ) : isError ? (
                      <span className="text-error text-sm">✗</span>
                    ) : (
                      <span className="loading loading-spinner loading-xs text-primary"></span>
                    )}
                  </div>
                  <div className="timeline-end text-xs">
                    {isDone && result?.genre ? (
                      <span
                        className="genre-badge"
                        style={{
                          backgroundColor: GENRE_COLORS[result.genre]?.bg,
                          color: GENRE_COLORS[result.genre]?.text,
                        }}
                      >
                        {GENRE_EMOJI[result.genre]} {result.genre}
                      </span>
                    ) : isError ? (
                      <span className="text-error">Failed</span>
                    ) : (
                      <span className="text-base-content/40">
                        {STEP_LABELS[fp.step] || "Processing..."}
                      </span>
                    )}
                  </div>
                  {i < entries.length - 1 && (
                    <hr className={isDone ? "bg-success" : isError ? "bg-error" : ""} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
