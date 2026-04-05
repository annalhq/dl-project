"use client";

import { FileProgress, SongResult } from "../lib/types";
import { STEP_LABELS, STEP_ORDER, GENRE_COLORS } from "../lib/constants";

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
      <div className="card-body items-center text-center gap-8 py-10">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Processing Pipeline</h2>
          <p className="text-xs text-base-content/40 font-mono uppercase tracking-widest">{overallPct}% complete</p>
        </div>

        {/* Overall radial progress */}
        <div
          className="radial-progress text-base-content font-light"
          style={{
            "--value": overallPct,
            "--size": "6rem",
            "--thickness": "0.15rem",
          } as React.CSSProperties}
          role="progressbar"
          aria-valuenow={overallPct}
        >
          <span className="text-xl font-mono">{completedCount}/{totalFiles}</span>
        </div>

        {/* Current file steps */}
        {activeEntry && (
          <div className="w-full max-w-lg mt-2">
            <p className="text-xs font-mono mb-4 text-base-content/70 truncate px-4">
              <span className="opacity-50 mr-2">CURRENT:</span>
              {activeEntry[0].replace(/\.mp3$/i, "")}
            </p>
            <ul className="steps steps-horizontal w-full text-[10px] font-mono tracking-widest uppercase">
              {STEP_ORDER.map((step) => {
                const currentIdx = STEP_ORDER.indexOf(activeEntry[1].step as typeof STEP_ORDER[number]);
                const stepIdx = STEP_ORDER.indexOf(step);
                const isActive = stepIdx <= currentIdx;
                return (
                  <li
                    key={step}
                    className={`step ${isActive ? "step-neutral text-base-content" : "text-base-content/20"}`}
                    data-content=""
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
          <div className="divider text-[10px] font-mono uppercase tracking-widest text-base-content/20 w-full mt-6">Log</div>
        )}

        {/* Completed files timeline */}
        {completedResults.length > 0 && (
          <ul className="timeline timeline-vertical timeline-compact w-full max-w-lg">
            {entries.map(([filename, fp], i) => {
              const isDone = fp.step === "complete";
              const isError = fp.step === "error";
              const result = completedResults.find((r) => r.filename === filename);

              return (
                <li key={filename}>
                  {i > 0 && <hr className={isDone ? "bg-base-content/20" : isError ? "bg-error/30" : "bg-base-content/5"} />}
                  <div className="timeline-start text-xs font-mono text-base-content/60 truncate max-w-[140px] py-1">
                    {filename.replace(/\.mp3$/i, "")}
                  </div>
                  <div className="timeline-middle px-2">
                    {isDone ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-base-content/40"></div>
                    ) : isError ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-error"></div>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-base-content animate-ping"></div>
                    )}
                  </div>
                  <div className="timeline-end text-xs font-mono py-1">
                    {isDone && result?.genre ? (
                      <span className="uppercase text-base-content">
                        {result.genre}
                      </span>
                    ) : isError ? (
                      <span className="text-error">ERROR</span>
                    ) : (
                      <span className="text-base-content/30 uppercase">
                        {STEP_LABELS[fp.step] || "PROCESSING"}
                      </span>
                    )}
                  </div>
                  {i < entries.length - 1 && (
                    <hr className={isDone ? "bg-base-content/20" : isError ? "bg-error/30" : "bg-base-content/5"} />
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
