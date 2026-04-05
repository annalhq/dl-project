"use client";

import { useState, useCallback } from "react";
import { AppView, DashboardViewMode, SongResult, FileProgress } from "./lib/types";
import { API_PREDICT_STREAM, API_PREDICT, GENRE_EMOJI, GENRES, pct } from "./lib/constants";

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
      r.probabilities?.[g] != null ? (r.probabilities[g] * 100).toFixed(2) : ""
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
  const [fileProgresses, setFileProgresses] = useState<Map<string, FileProgress>>(new Map());
  const [dashViewMode, setDashViewMode] = useState<DashboardViewMode>("grid");
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  // ── File Management ────────────────────────────────────────────────────
  const addFiles = useCallback((incoming: FileList | File[]) => {
    const mp3s = Array.from(incoming).filter((f) =>
      f.name.toLowerCase().endsWith(".mp3")
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
          }))
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

  const sortedGenres = Object.entries(grouped)
    .sort((a, b) => b[1].length - a[1].length);

  const genreCounts = Object.fromEntries(sortedGenres.map(([g, songs]) => [g, songs.length]));
  const detectedGenres = sortedGenres.map(([g]) => g);
  const topGenre = sortedGenres.length > 0 ? sortedGenres[0][0] : null;
  const errorResults = results.filter((r) => r.error);

  const filteredResults = activeGenre
    ? results.filter((r) => r.genre === activeGenre)
    : results.filter((r) => r.genre);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      {/* ── Upload View ── */}
      {view === "upload" && (
        <>
          <HeroSection />

          <div className="card card-border bg-base-100 shadow-sm p-6 sm:p-8 mb-6">
            <UploadZone onFilesAdded={addFiles} />

            {files.length > 0 && (
              <>
                <div className="divider text-[10px] uppercase tracking-widest font-mono text-base-content/40 mt-8 mb-6">
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
                    className="btn btn-neutral btn-lg px-12 tracking-widest font-mono text-xs uppercase"
                  >
                    Execute Inference ({files.length})
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
          <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-up">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold tracking-tight">Analysis Report</h2>
              <span className="px-2 py-0.5 rounded-full bg-base-content/10 font-mono text-[10px]">{results.length} ENTRIES</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportCSV(results)}
                className="btn btn-ghost btn-sm font-mono text-[10px] tracking-widest uppercase"
              >
                Output CSV
              </button>
              <button
                id="classify-again-btn"
                onClick={reset}
                className="btn btn-outline btn-sm font-mono text-[10px] tracking-widest uppercase border-base-content/20"
              >
                New Session
              </button>
            </div>
          </div>

          {/* Filter + View toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
            <GenreFilter
              genres={detectedGenres}
              genreCounts={genreCounts}
              activeGenre={activeGenre}
              onSelect={setActiveGenre}
            />
            <div className="flex bg-base-content/5 p-1 rounded font-mono text-[10px] uppercase tracking-widest">
              <button
                className={`px-3 py-1.5 rounded transition-colors ${dashViewMode === "grid" ? "bg-base-100 shadow-sm text-base-content" : "text-base-content/40 hover:text-base-content/80"}`}
                onClick={() => setDashViewMode("grid")}
              >
                Deck
              </button>
              <button
                className={`px-3 py-1.5 rounded transition-colors ${dashViewMode === "table" ? "bg-base-100 shadow-sm text-base-content" : "text-base-content/40 hover:text-base-content/80"}`}
                onClick={() => setDashViewMode("table")}
              >
                Log
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
            <div className="card card-border bg-base-100 shadow-sm">
              <SongTable results={filteredResults} />
            </div>
          )}

          {/* Errors */}
          {errorResults.length > 0 && (
            <div className="space-y-3 animate-fade-up mt-8 border-t border-error/20 pt-6">
              <h3 className="text-sm font-semibold text-error tracking-tight">
                PROCESSING ERRORS ({errorResults.length})
              </h3>
              {errorResults.map((r) => (
                <div key={r.filename} className="p-3 bg-error/5 border border-error/10 rounded font-mono text-[10px] text-error">
                  <span className="font-bold opacity-80 mr-2">[{r.filename}]</span> 
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
