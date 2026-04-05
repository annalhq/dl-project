"use client";

import { useState, useCallback } from "react";
import {
  AppView,
  DashboardViewMode,
  SongResult,
  FileProgress,
} from "./lib/types";
import { API_PREDICT_STREAM, API_PREDICT, GENRES } from "./lib/constants";

import HeroSection from "./components/HeroSection";
import UploadZone from "./components/UploadZone";
import FileQueue from "./components/FileQueue";
import AnalyzingProgress from "./components/AnalyzingProgress";
import DashboardStats from "./components/DashboardStats";
import GenreFilter from "./components/GenreFilter";
import SongCard from "./components/SongCard";
import SongTable from "./components/SongTable";

// ── CSV Export ─────────────────────────────────────────────────────────────
function exportCSV(results: SongResult[]) {
  const headers = ["Filename", "Genre", "Confidence", ...GENRES];
  const rows = results.map((r) => [
    r.filename,
    r.genre ?? "error",
    r.confidence != null ? (r.confidence * 100).toFixed(1) : "",
    ...GENRES.map((g) =>
      r.probabilities?.[g] != null ? (r.probabilities[g] * 100).toFixed(2) : "",
    ),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `soundsort-results-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [view, setView] = useState<AppView>("upload");
  const [results, setResults] = useState<SongResult[]>([]);
  const [fileProgresses, setFileProgresses] = useState<
    Map<string, FileProgress>
  >(new Map());
  const [dashViewMode, setDashViewMode] = useState<DashboardViewMode>("grid");
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  // ── File Management ────────────────────────────────────────────────────
  const addFiles = useCallback((incoming: FileList | File[]) => {
    const mp3s = Array.from(incoming).filter((f) =>
      f.name.toLowerCase().endsWith(".mp3"),
    );
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...mp3s.filter((f) => !names.has(f.name))];
    });
  }, []);

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  // ── Classification with SSE ────────────────────────────────────────────
  const handleClassify = async () => {
    if (!files.length) return;

    setView("analyzing");
    setResults([]);
    setFileProgresses(new Map());

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    try {
      // Try SSE endpoint first
      const res = await fetch(API_PREDICT_STREAM, {
        method: "POST",
        body: formData,
      });

      if (!res.ok || !res.body) {
        throw new Error("SSE not available");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const collectedResults: SongResult[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.done) {
              // Stream complete
              setResults([...collectedResults]);
              setView("dashboard");
              return;
            }

            const fp: FileProgress = {
              filename: event.file,
              step: event.step,
              progress: event.progress,
              result: event.result,
              error: event.error,
            };

            setFileProgresses((prev) => {
              const next = new Map(prev);
              next.set(event.file, fp);
              return next;
            });

            if (event.step === "complete" && event.result) {
              collectedResults.push(event.result);
              setResults([...collectedResults]);
            } else if (event.step === "error") {
              collectedResults.push({
                filename: event.file,
                genre: null,
                confidence: null,
                probabilities: null,
                error: event.error || "Unknown error",
              });
              setResults([...collectedResults]);
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }

      // If we exit the loop normally, transition to dashboard
      if (collectedResults.length > 0) {
        setResults([...collectedResults]);
      }
      setView("dashboard");
    } catch {
      // Fallback to regular /predict endpoint
      try {
        const formData2 = new FormData();
        files.forEach((f) => formData2.append("files", f));

        const res = await fetch(API_PREDICT, {
          method: "POST",
          body: formData2,
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setResults(data.results);
      } catch (err) {
        setResults(
          files.map((f) => ({
            filename: f.name,
            genre: null,
            confidence: null,
            probabilities: null,
            error: err instanceof Error ? err.message : "Unknown error",
          })),
        );
      }
      setView("dashboard");
    }
  };

  const reset = () => {
    setFiles([]);
    setResults([]);
    setView("upload");
    setActiveGenre(null);
    setFileProgresses(new Map());
  };

  // ── Computed values for dashboard ──────────────────────────────────────
  const grouped = results.reduce<Record<string, SongResult[]>>((acc, r) => {
    if (r.genre) {
      acc[r.genre] = [...(acc[r.genre] ?? []), r];
    }
    return acc;
  }, {});

  const sortedGenres = Object.entries(grouped).sort(
    (a, b) => b[1].length - a[1].length,
  );

  const genreCounts = Object.fromEntries(
    sortedGenres.map(([g, songs]) => [g, songs.length]),
  );
  const detectedGenres = sortedGenres.map(([g]) => g);
  const topGenre = sortedGenres.length > 0 ? sortedGenres[0][0] : null;
  const errorResults = results.filter((r) => r.error);

  const filteredResults = activeGenre
    ? results.filter((r) => r.genre === activeGenre)
    : results.filter((r) => r.genre);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      {/* ── Upload View ── */}
      {view === "upload" && (
        <>
          <HeroSection />

          <div className="card card-border surface-card mb-6 p-6 sm:p-8">
            <UploadZone onFilesAdded={addFiles} />

            {files.length > 0 && (
              <>
                <div
                  className="divider mb-6 mt-8 text-[10px] uppercase tracking-[0.2em] text-base-content/45"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  Ready Sequence
                </div>
                <FileQueue
                  files={files}
                  onRemove={removeFile}
                  onClearAll={() => setFiles([])}
                />

                {/* Classify button */}
                <div className="mt-8 flex justify-center">
                  <button
                    id="classify-btn"
                    onClick={handleClassify}
                    disabled={!files.length}
                    className="btn btn-primary btn-lg px-12 text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    Run Analysis ({files.length})
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ── Analyzing View ── */}
      {view === "analyzing" && (
        <div className="py-12">
          <AnalyzingProgress
            fileProgresses={fileProgresses}
            totalFiles={files.length}
            completedResults={results}
          />
        </div>
      )}

      {/* ── Dashboard View ── */}
      {view === "dashboard" && results.length > 0 && (
        <div className="py-8 space-y-6">
          {/* Stats */}
          <DashboardStats
            results={results}
            genreCount={detectedGenres.length}
            topGenre={topGenre}
          />

          {/* Action bar */}
          <div className="animate-fade-up surface-card rounded-2xl border border-base-300/70 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-tight">
                  Analysis Report
                </h2>
                <span
                  className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  {results.length} ENTRIES
                </span>
              </div>

              <div className="join">
                <button
                  onClick={() => exportCSV(results)}
                  className="join-item btn btn-outline btn-sm text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  Export CSV
                </button>
                <button
                  id="classify-again-btn"
                  onClick={reset}
                  className="join-item btn btn-primary btn-sm text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: "var(--font-jetbrains)" }}
                >
                  New Session
                </button>
              </div>
            </div>
          </div>

          {/* Filter + View toggle */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <GenreFilter
              genres={detectedGenres}
              genreCounts={genreCounts}
              activeGenre={activeGenre}
              onSelect={setActiveGenre}
            />
            <div
              role="tablist"
              className="tabs tabs-box border border-base-300/70 bg-base-100 p-1"
            >
              <button
                role="tab"
                className={`tab px-4 text-[11px] uppercase tracking-[0.17em] ${dashViewMode === "grid" ? "tab-active text-primary" : "text-base-content/65"}`}
                style={{ fontFamily: "var(--font-jetbrains)" }}
                onClick={() => setDashViewMode("grid")}
              >
                Card Deck
              </button>
              <button
                role="tab"
                className={`tab px-4 text-[11px] uppercase tracking-[0.17em] ${dashViewMode === "table" ? "tab-active text-primary" : "text-base-content/65"}`}
                style={{ fontFamily: "var(--font-jetbrains)" }}
                onClick={() => setDashViewMode("table")}
              >
                Table Log
              </button>
            </div>
          </div>

          {/* Grid View */}
          {dashViewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
              {filteredResults.map((r, i) => (
                <SongCard key={r.filename} result={r} index={i} />
              ))}
            </div>
          )}

          {/* Table View */}
          {dashViewMode === "table" && (
            <div className="card card-border surface-card">
              <SongTable results={filteredResults} />
            </div>
          )}

          {/* Errors */}
          {errorResults.length > 0 && (
            <div className="mt-8 space-y-3 border-t border-error/30 pt-6 animate-fade-up">
              <h3 className="text-sm font-semibold tracking-tight text-error">
                PROCESSING ERRORS ({errorResults.length})
              </h3>
              {errorResults.map((r) => (
                <div
                  key={r.filename}
                  className="alert rounded-xl border border-error/25 bg-error/10 text-error"
                >
                  <span className="font-bold opacity-80 mr-2">
                    [{r.filename}]
                  </span>
                  {r.error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
