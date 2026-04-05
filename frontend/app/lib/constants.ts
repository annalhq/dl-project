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

// Dark-optimized genre badge colors
export const GENRE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blues:     { bg: "rgba(56, 189, 248, 0.12)", text: "#7dd3fc", border: "rgba(56, 189, 248, 0.25)" },
  classical: { bg: "rgba(167, 139, 250, 0.12)", text: "#c4b5fd", border: "rgba(167, 139, 250, 0.25)" },
  country:   { bg: "rgba(251, 191, 36, 0.12)",  text: "#fcd34d", border: "rgba(251, 191, 36, 0.25)" },
  disco:     { bg: "rgba(244, 114, 182, 0.12)", text: "#f9a8d4", border: "rgba(244, 114, 182, 0.25)" },
  hiphop:    { bg: "rgba(248, 113, 113, 0.12)", text: "#fca5a5", border: "rgba(248, 113, 113, 0.25)" },
  metal:     { bg: "rgba(148, 163, 184, 0.12)", text: "#cbd5e1", border: "rgba(148, 163, 184, 0.25)" },
  pop:       { bg: "rgba(96, 165, 250, 0.12)",  text: "#93c5fd", border: "rgba(96, 165, 250, 0.25)" },
  reggae:    { bg: "rgba(74, 222, 128, 0.12)",  text: "#86efac", border: "rgba(74, 222, 128, 0.25)" },
  rock:      { bg: "rgba(251, 146, 60, 0.12)",  text: "#fdba74", border: "rgba(251, 146, 60, 0.25)" },
};

// ── Processing step labels ─────────────────────────────────────────────────
export const STEP_LABELS: Record<string, string> = {
  uploading: "Upload",
  converting_wav: "Convert",
  extracting_segment: "Extract",
  generating_spectrogram: "Spectrogram",
  analyzing: "Analyze",
  complete: "Done",
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
