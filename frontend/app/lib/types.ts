// ── Result types from the backend ──────────────────────────────────────────
export type Probabilities = Record<string, number>;

export interface SongResult {
  filename: string;
  genre: string | null;
  confidence: number | null;
  probabilities: Probabilities | null;
  error?: string;
}

// ── Processing / SSE types ─────────────────────────────────────────────────
export type ProcessingStep =
  | "uploading"
  | "converting_wav"
  | "extracting_segment"
  | "generating_spectrogram"
  | "analyzing"
  | "complete"
  | "error";

export interface FileProgress {
  filename: string;
  step: ProcessingStep;
  progress: number; // 0-100
  result?: SongResult;
  error?: string;
}

// ── App state ──────────────────────────────────────────────────────────────
export type AppView = "upload" | "analyzing" | "dashboard";

export type DashboardViewMode = "grid" | "table";

export type SortField = "filename" | "genre" | "confidence";
export type SortDirection = "asc" | "desc";
