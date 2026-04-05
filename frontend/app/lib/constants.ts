// ── Genre metadata ─────────────────────────────────────────────────────────
export const GENRES = [
  "blues", "classical", "country", "disco",
  "hiphop", "metal", "pop", "reggae", "rock",
] as const;

export type GenreName = (typeof GENRES)[number];

export const GENRE_EMOJI: Record<string, string> = {
  blues: "", classical: "", country: "", disco: "",
  hiphop: "", metal: "", pop: "", reggae: "", rock: "",
};

export const GENRE_DESC: Record<string, string> = {
  blues: "Soulful", classical: "Orchestral",
  country: "Roots", disco: "Groovy",
  hiphop: "Rhythmic", metal: "Heavy",
  pop: "Melodic", reggae: "Laid-back",
  rock: "Electric",
};

// Light theme badge colors with readable contrast
export const GENRE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blues: { bg: "#eaf3ff", text: "#1f4b8f", border: "#bed8ff" },
  classical: { bg: "#f3efff", text: "#58379f", border: "#dacfff" },
  country: { bg: "#fdf4df", text: "#915e12", border: "#f3d8a1" },
  disco: { bg: "#ffe9f3", text: "#9c2f62", border: "#f9bdd7" },
  hiphop: { bg: "#ecefff", text: "#2d3f9c", border: "#c8d0ff" },
  metal: { bg: "#eceff4", text: "#3b4554", border: "#cbd2df" },
  pop: { bg: "#e9fff7", text: "#1f7b63", border: "#b8efd9" },
  reggae: { bg: "#fff7e6", text: "#8c6f15", border: "#f1dd9f" },
  rock: { bg: "#feeeee", text: "#9c3434", border: "#f6c1c1" },
};

// ── Processing step labels ─────────────────────────────────────────────────
export const STEP_LABELS: Record<string, string> = {
  uploading: "Uploading",
  converting_wav: "Converting to WAV",
  extracting_segment: "Extracting Audio",
  generating_spectrogram: "Generating Spectrogram",
  analyzing: "CNN Analysis",
  complete: "Complete",
  error: "Error",
};

export const STEP_ORDER = [
  "uploading",
  "converting_wav",
  "extracting_segment",
  "generating_spectrogram",
  "analyzing",
  "complete",
] as const;

// ── API ────────────────────────────────────────────────────────────────────
export const API_BASE = "http://localhost:8000";
export const API_PREDICT = `${API_BASE}/predict`;
export const API_PREDICT_STREAM = `${API_BASE}/predict-stream`;
export const API_HEALTH = `${API_BASE}/health`;

// ── Helpers ────────────────────────────────────────────────────────────────
export function pct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
