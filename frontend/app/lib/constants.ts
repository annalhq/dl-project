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

// Monochrome badge colors
export const GENRE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blues: { bg: "#e0f2fe", text: "#0c4a6e", border: "#7dd3fc" },
  classical: { bg: "#ede9fe", text: "#4c1d95", border: "#c4b5fd" },
  country: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  disco: { bg: "#fce7f3", text: "#9d174d", border: "#f9a8d4" },
  hiphop: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  metal: { bg: "#e5e7eb", text: "#1f2937", border: "#9ca3af" },
  pop: { bg: "#dbeafe", text: "#1e3a8a", border: "#93c5fd" },
  reggae: { bg: "#dcfce7", text: "#166534", border: "#86efac" },
  rock: { bg: "#ffedd5", text: "#9a3412", border: "#fdba74" },
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
