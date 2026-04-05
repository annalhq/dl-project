"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
type Probabilities = Record<string, number>;

interface SongResult {
  filename: string;
  genre: string | null;
  confidence: number | null;
  probabilities: Probabilities | null;
  error?: string;
}

type ProcessingState = "idle" | "uploading" | "done";

// ── Constants ──────────────────────────────────────────────────────────────
const GENRES = [
  "blues", "classical", "country", "disco",
  "hiphop", "metal", "pop", "reggae", "rock",
] as const;

const GENRE_EMOJI: Record<string, string> = {
  blues: "🎷", classical: "🎻", country: "🤠", disco: "🕺",
  hiphop: "🎤", metal: "🤘", pop: "🎵", reggae: "🌴", rock: "🎸",
};

const GENRE_DESC: Record<string, string> = {
  blues: "Soulful & expressive", classical: "Orchestral & timeless",
  country: "Roots & storytelling", disco: "Groovy & danceable",
  hiphop: "Rhythmic & lyrical", metal: "Heavy & powerful",
  pop: "Catchy & melodic", reggae: "Laid-back & rhythmic",
  rock: "Energetic & electric",
};

const API_URL = "http://localhost:8000/predict";

// ── Helper: format confidence ──────────────────────────────────────────────
function pct(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

// ── Genre Badge ────────────────────────────────────────────────────────────
function GenreBadge({ genre }: { genre: string }) {
  return (
    <span
      className={`badge badge-${genre} border text-xs font-semibold px-3 py-1 rounded-full capitalize`}
    >
      {GENRE_EMOJI[genre]} {genre}
    </span>
  );
}

// ── Probability Bar ────────────────────────────────────────────────────────
function ProbBar({
  genre, value, isTop,
}: { genre: string; value: number; isTop: boolean }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value * 100), 50);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className={`w-20 capitalize text-right text-xs font-medium ${
          isTop ? "text-indigo-300" : "text-slate-400"
        }`}
      >
        {genre}
      </span>
      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="genre-bar-fill"
          style={{
            width: `${width}%`,
            background: isTop
              ? "linear-gradient(90deg,#6366f1,#a855f7)"
              : "rgba(148,163,184,0.4)",
          }}
        />
      </div>
      <span className={`w-12 text-right text-xs ${isTop ? "text-indigo-300 font-semibold" : "text-slate-500"}`}>
        {pct(value)}
      </span>
    </div>
  );
}

// ── Song Card ──────────────────────────────────────────────────────────────
function SongCard({ result, index }: { result: SongResult; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const name = result.filename.replace(/\.mp3$/i, "");

  if (result.error) {
    return (
      <div
        className="glass-card p-4 animate-fade-up"
        style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">⚠</div>
          <div>
            <p className="font-semibold text-sm text-slate-200">{name}</p>
            <p className="text-xs text-red-400 mt-0.5">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedProbs = result.probabilities
    ? Object.entries(result.probabilities).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div
      className="glass-card glow-hover animate-fade-up"
      style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xl flex-shrink-0 icon-${result.genre}`}
            >
              {GENRE_EMOJI[result.genre!] ?? "🎵"}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-100 truncate" title={name}>
                {name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{result.filename}</p>
            </div>
          </div>
          <GenreBadge genre={result.genre!} />
        </div>

        {/* Confidence */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">Confidence</span>
            <span className="text-indigo-300 font-semibold">{pct(result.confidence!)}</span>
          </div>
          <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
            <ConfidenceBar value={result.confidence!} />
          </div>
        </div>

        {/* Toggle details */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          aria-expanded={expanded}
          aria-controls={`probs-${result.filename}`}
        >
          <span>{expanded ? "Hide" : "Show"} all probabilities</span>
          <span className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>▾</span>
        </button>

        {/* Probability breakdown */}
        {expanded && (
          <div
            id={`probs-${result.filename}`}
            className="mt-3 space-y-2 border-t border-slate-800 pt-3"
          >
            {sortedProbs.map(([g, v]) => (
              <ProbBar key={g} genre={g} value={v} isTop={g === result.genre} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value * 100), 80);
    return () => clearTimeout(t);
  }, [value]);
  return <div className="genre-bar-fill" style={{ width: `${width}%` }} />;
}

// ── Genre Section (groups songs of same genre) ─────────────────────────────
function GenreSection({
  genre, songs,
}: { genre: string; songs: SongResult[] }) {
  return (
    <div className="animate-fade-up" style={{ opacity: 0 }}>
      {/* Section header */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-slate-800/60 icon-${genre} flex-shrink-0`}
        >
          {GENRE_EMOJI[genre] ?? "🎵"}
        </div>
        <div>
          <h2 className="text-lg font-bold capitalize text-slate-100">
            {genre}
          </h2>
          <p className="text-xs text-slate-500">
            {GENRE_DESC[genre]} · {songs.length} song{songs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="ml-auto">
          <span className="badge badge-outline text-slate-400 border-slate-700 text-xs">
            {songs.length}
          </span>
        </div>
      </div>

      {/* Song cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {songs.map((s, i) => (
          <SongCard key={s.filename} result={s} index={i} />
        ))}
      </div>
    </div>
  );
}

// ── File Chip (shown in upload zone) ──────────────────────────────────────
function FileChip({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1.5 text-xs text-indigo-300">
      <span className="truncate max-w-[160px]">{name.replace(/\.mp3$/i, "")}</span>
      <button
        onClick={onRemove}
        className="text-indigo-400 hover:text-red-400 transition-colors flex-shrink-0"
        aria-label={`Remove ${name}`}
      >
        ✕
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessingState>("idle");
  const [results, setResults] = useState<SongResult[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Group results by genre
  const grouped = results.reduce<Record<string, SongResult[]>>((acc, r) => {
    if (r.genre) {
      acc[r.genre] = [...(acc[r.genre] ?? []), r];
    }
    return acc;
  }, {});

  // Sort genres by count (most songs first)
  const sortedGenres = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
  const errorResults = results.filter((r) => r.error);

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

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleClassify = async () => {
    if (!files.length) return;
    setState("uploading");
    setResults([]);

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    try {
      const res = await fetch(API_URL, { method: "POST", body: formData });
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
    } finally {
      setState("done");
    }
  };

  const reset = () => {
    setFiles([]);
    setResults([]);
    setState("idle");
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">

        {/* ── Hero ── */}
        <header className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs text-indigo-300 font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse inline-block" />
            Powered by CNN Deep Learning
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 leading-tight">
            <span className="gradient-text">SoundSort</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Upload your MP3 files and our AI instantly classifies each song into its genre —
            perfect for auditions, playlist curation & music organization.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {GENRES.map((g) => (
              <span key={g} className={`badge badge-${g} border text-xs font-medium px-3 py-1 rounded-full capitalize`}>
                {GENRE_EMOJI[g]} {g}
              </span>
            ))}
          </div>
        </header>

        {/* ── Upload Section ── */}
        {state !== "done" && (
          <div className="glass-card p-8 mb-10 animate-fade-up" style={{ opacity: 0 }}>
            {/* Dropzone */}
            <div
              id="dropzone"
              role="button"
              tabIndex={0}
              aria-label="Upload MP3 files"
              className={`dropzone flex flex-col items-center justify-center py-14 gap-4 ${dragOver ? "drag-over" : ""}`}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className={`text-5xl animate-float ${dragOver ? "scale-125" : ""} transition-transform duration-200`}>
                🎵
              </div>
              <div className="text-center">
                <p className="text-slate-200 font-semibold text-lg">
                  Drop MP3 files here
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  or <span className="text-indigo-400 underline cursor-pointer">click to browse</span>
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                id="file-input"
                className="hidden"
                accept=".mp3,audio/mpeg"
                multiple
                onChange={onFileChange}
              />
            </div>

            {/* File chips */}
            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-400">
                    <span className="text-indigo-300 font-semibold">{files.length}</span> file{files.length !== 1 ? "s" : ""} selected
                  </span>
                  <button
                    onClick={() => setFiles([])}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {files.map((f) => (
                    <FileChip key={f.name} name={f.name} onRemove={() => removeFile(f.name)} />
                  ))}
                </div>
              </div>
            )}

            {/* Classify button */}
            <div className="mt-6 flex justify-center">
              <button
                id="classify-btn"
                onClick={handleClassify}
                disabled={!files.length || state === "uploading"}
                className="btn bg-indigo-600 hover:bg-indigo-500 text-white border-0 rounded-xl px-10 py-3 font-semibold text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
              >
                {state === "uploading" ? (
                  <span className="flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                    Analyzing {files.length} song{files.length !== 1 ? "s" : ""}…
                  </span>
                ) : (
                  `✦ Classify ${files.length || ""} Song${files.length !== 1 ? "s" : ""}`
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {state === "done" && results.length > 0 && (
          <div>
            {/* Summary bar */}
            <div className="glass-card p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-up" style={{ opacity: 0 }}>
              <div>
                <p className="text-slate-200 font-bold text-lg">
                  ✦ Classification Complete
                </p>
                <p className="text-slate-500 text-sm mt-0.5">
                  {results.length} song{results.length !== 1 ? "s" : ""} across{" "}
                  <span className="text-indigo-300 font-semibold">
                    {sortedGenres.length} genre{sortedGenres.length !== 1 ? "s" : ""}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Mini genre summary pills */}
                <div className="flex flex-wrap gap-2">
                  {sortedGenres.map(([g, songs]) => (
                    <span key={g} className={`badge badge-${g} border text-xs px-2.5 py-1 rounded-full capitalize font-medium`}>
                      {GENRE_EMOJI[g]} {g} · {songs.length}
                    </span>
                  ))}
                </div>
                <button
                  id="classify-again-btn"
                  onClick={reset}
                  className="btn btn-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 rounded-xl text-xs"
                >
                  ↺ New Upload
                </button>
              </div>
            </div>

            {/* Genre sections */}
            <div className="space-y-10">
              {sortedGenres.map(([genre, songs]) => (
                <GenreSection key={genre} genre={genre} songs={songs} />
              ))}
            </div>

            {/* Errors section */}
            {errorResults.length > 0 && (
              <div className="mt-10">
                <h2 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <span>⚠</span> Failed to process ({errorResults.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {errorResults.map((r, i) => (
                    <SongCard key={r.filename} result={r} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="text-center mt-20 text-xs text-slate-600">
          Built with CNN · FastAPI · Next.js · DaisyUI
        </footer>
      </div>
    </main>
  );
}
