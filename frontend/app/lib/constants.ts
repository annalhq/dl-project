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
  blues:     { bg: "transparent", text: "#e5e5e5", border: "#262626" },
  classical: { bg: "transparent", text: "#e5e5e5", border: "#262626" },
  country:   { bg: "transparent", text: "#e5e5e5", border: "#262626" },
  disco:     { bg: "transparent", text: "#e5e5e5", border: "#262626" },
  hiphop:    { bg: "transparent", text: "#e5e5e5", border: "#262626" },
  metal:     { bg: "transparent", text: "#e5e5e5", border: "#262626" },
  pop:       { bg: "transparent", text: "#e5e5e5", border: "#262626" },
  reggae:    { bg: "transparent", text: "#e5e5e5", border: "#262626" },
  rock:      { bg: "transparent", text: "#e5e5e5", border: "#262626" },
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
