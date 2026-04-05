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

      if (collectedResults.length > 0) {
        setResults([...collectedResults]);
      }
      setView("dashboard");
    } catch {
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
  const successfulResults = results.filter((r) => r.genre && !r.error);
  const avgConfidence =
    successfulResults.length > 0
      ? successfulResults.reduce((acc, r) => acc + (r.confidence ?? 0), 0) /
        successfulResults.length
      : 0;

  const filteredResults = activeGenre
    ? results.filter((r) => r.genre === activeGenre)
    : results.filter((r) => r.genre);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
      {/* ── Upload View ── */}
      {view === "upload" && (
        <>
          <HeroSection />

          <div className="card bg-base-100 border border-base-content/8 shadow-lg p-6 sm:p-8 mb-6 animate-fade-up">
            <UploadZone onFilesAdded={addFiles} />

            {files.length > 0 && (
              <>
                <div className="divider text-xs uppercase tracking-widest font-mono text-base-content/30 mt-10 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                  </svg>
                  Ready Queue
                </div>

                <FileQueue
                  files={files}
                  onRemove={removeFile}
                  onClearAll={() => setFiles([])}
                />

                {/* Classify button */}
                <div className="mt-10 flex justify-center">
                  <button
                    id="classify-btn"
                    onClick={handleClassify}
                    disabled={!files.length}
                    className="btn btn-primary btn-lg gap-3 px-10 text-sm font-semibold tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                    </svg>
                    Run Classification ({files.length})
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
          {/* Dashboard header */}
          <section className="relative overflow-hidden rounded-2xl border border-base-content/8 bg-base-100 px-6 py-7 sm:px-8 sm:py-8 shadow-lg animate-fade-up">
            {/* Ambient gradients */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,oklch(72%_0.19_154_/_0.08),transparent_45%),radial-gradient(circle_at_85%_20%,oklch(68%_0.16_250_/_0.08),transparent_42%)]" />

            <div className="relative flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-3">
                <div className="badge badge-primary badge-outline badge-sm font-mono text-xs tracking-wider uppercase gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                  Dashboard
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content">
                  Analysis Report
                </h2>

                <p className="text-sm sm:text-base text-base-content/60 max-w-2xl leading-relaxed">
                  {topGenre
                    ? `Dominant genre is ${topGenre} across ${detectedGenres.length} detected categories in this batch.`
                    : "Batch completed. Review results by card view or detailed table."}
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-2 min-w-[200px]">
                <button
                  onClick={() => exportCSV(results)}
                  className="btn btn-primary btn-sm gap-2 font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Export CSV
                </button>
                <button
                  id="classify-again-btn"
                  onClick={reset}
                  className="btn btn-ghost btn-sm gap-2 font-medium border border-base-content/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                  </svg>
                  New Session
                </button>
              </div>
            </div>

            {/* Quick stat cards */}
            <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-base-content/8 bg-base-200/40 px-4 py-3.5">
                <p className="text-xs font-medium uppercase tracking-wider text-base-content/40 mb-1">
                  Confidence
                </p>
                <p className="text-xl font-bold tabular-nums text-base-content">
                  {(avgConfidence * 100).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-xl border border-base-content/8 bg-base-200/40 px-4 py-3.5">
                <p className="text-xs font-medium uppercase tracking-wider text-base-content/40 mb-1">
                  Top Genre
                </p>
                <p className="text-xl font-bold text-base-content uppercase truncate">
                  {topGenre ?? "N/A"}
                </p>
              </div>
              <div className="rounded-xl border border-base-content/8 bg-base-200/40 px-4 py-3.5">
                <p className="text-xs font-medium uppercase tracking-wider text-base-content/40 mb-1">
                  Detected
                </p>
                <p className="text-xl font-bold tabular-nums text-base-content">
                  {detectedGenres.length}
                </p>
              </div>
              <div className="rounded-xl border border-base-content/8 bg-base-200/40 px-4 py-3.5">
                <p className="text-xs font-medium uppercase tracking-wider text-base-content/40 mb-1">
                  Entries
                </p>
                <p className="text-xl font-bold tabular-nums text-base-content">
                  {results.length}
                </p>
              </div>
            </div>
          </section>

          {/* Detailed Stats */}
          <DashboardStats
            results={results}
            genreCount={detectedGenres.length}
            topGenre={topGenre}
          />

          {/* Filter + View toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-2 rounded-xl border border-base-content/8 bg-base-100 px-4 py-3.5 shadow-sm animate-fade-up">
            <GenreFilter
              genres={detectedGenres}
              genreCounts={genreCounts}
              activeGenre={activeGenre}
              onSelect={setActiveGenre}
            />

            {/* View mode toggle */}
            <div className="join">
              <button
                className={`join-item btn btn-sm gap-1.5 ${dashViewMode === "grid" ? "btn-active" : ""}`}
                onClick={() => setDashViewMode("grid")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
                Cards
              </button>
              <button
                className={`join-item btn btn-sm gap-1.5 ${dashViewMode === "table" ? "btn-active" : ""}`}
                onClick={() => setDashViewMode("table")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                </svg>
                Table
              </button>
            </div>
          </div>

          {/* Grid View */}
          {dashViewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
              {filteredResults.map((r, i) => (
                <SongCard key={r.filename} result={r} index={i} />
              ))}
            </div>
          )}

          {/* Table View */}
          {dashViewMode === "table" && (
            <div className="card bg-base-100 border border-base-content/8 shadow-sm p-4 sm:p-5 animate-fade-up">
              <SongTable results={filteredResults} />
            </div>
          )}

          {/* Errors */}
          {errorResults.length > 0 && (
            <div className="alert alert-error shadow-md mt-6 animate-fade-up">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold text-sm">
                  Processing Errors ({errorResults.length})
                </h3>
                <div className="mt-2 space-y-1">
                  {errorResults.map((r) => (
                    <p key={r.filename} className="text-xs opacity-80">
                      <span className="font-semibold">[{r.filename}]</span>{" "}
                      {r.error}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
