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
                <div className="divider text-xs text-base-content/40">
                  Ready to classify
                </div>
                <FileQueue
                  files={files}
                  onRemove={removeFile}
                  onClearAll={() => setFiles([])}
                />

                {/* Classify button */}
                <div className="mt-6 flex justify-center">
                  <button
                    id="classify-btn"
                    onClick={handleClassify}
                    disabled={!files.length}
                    className="btn btn-primary btn-lg gap-2 shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.784l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .784.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.784l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684Z" />
                    </svg>
                    Classify {files.length} Song{files.length !== 1 ? "s" : ""}
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
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Results</h2>
              <span className="badge badge-primary badge-sm">{results.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportCSV(results)}
                className="btn btn-ghost btn-sm gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                  <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
                Export CSV
              </button>
              <button
                id="classify-again-btn"
                onClick={reset}
                className="btn btn-outline btn-primary btn-sm gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H4.28a.75.75 0 0 0-.75.75v3.955a.75.75 0 0 0 1.5 0v-2.134l.235.234A7 7 0 0 0 17 11.424a.75.75 0 0 0-1.688 0ZM4.688 8.576a5.5 5.5 0 0 1 9.201-2.466l.312.311H11.77a.75.75 0 0 0 0 1.5h3.952a.75.75 0 0 0 .75-.75V3.216a.75.75 0 0 0-1.5 0v2.134l-.235-.234A7 7 0 0 0 3 8.576a.75.75 0 0 0 1.688 0Z" clipRule="evenodd" />
                </svg>
                New Upload
              </button>
            </div>
          </div>

          {/* Filter + View toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <GenreFilter
              genres={detectedGenres}
              genreCounts={genreCounts}
              activeGenre={activeGenre}
              onSelect={setActiveGenre}
            />
            <div className="tabs tabs-box tabs-sm">
              <button
                className={`tab ${dashViewMode === "grid" ? "tab-active" : ""}`}
                onClick={() => setDashViewMode("grid")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                  <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd" />
                </svg>
                Grid
              </button>
              <button
                className={`tab ${dashViewMode === "table" ? "tab-active" : ""}`}
                onClick={() => setDashViewMode("table")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                  <path fillRule="evenodd" d="M.99 5.24A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25l.01 9.5A2.25 2.25 0 0 1 16.76 17H3.26A2.25 2.25 0 0 1 1 14.75l-.01-9.51Zm8.26 9.52v-3.5H3.26a.75.75 0 0 0-.76.75v2a.75.75 0 0 0 .76.75h5.99Zm1.5 0h5.99a.75.75 0 0 0 .76-.75v-2a.75.75 0 0 0-.76-.75h-5.99v3.5Zm5.99-5h-5.99v-3.5h5.99a.75.75 0 0 0 .76-.75v-2a.75.75 0 0 0-.76-.75h-5.99v3.5Z" clipRule="evenodd" />
                </svg>
                Table
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
            <div className="space-y-2 animate-fade-up">
              <h3 className="text-sm font-semibold text-error flex items-center gap-2">
                ⚠️ Failed to process ({errorResults.length})
              </h3>
              {errorResults.map((r) => (
                <div key={r.filename} className="alert alert-error alert-sm">
                  <span>
                    <strong>{r.filename}</strong>: {r.error}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
