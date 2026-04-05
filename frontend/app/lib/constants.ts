// ── Genre metadata ─────────────────────────────────────────────────────────
export const GENRES = [
  "blues", "classical", "country", "disco",
  "hiphop", "metal", "pop", "reggae", "rock",
] as const;

export type GenreName = (typeof GENRES)[number];

export const GENRE_EMOJI: Record<string, string> = {
  blues: "🎷", classical: "🎻", country: "🤠", disco: "🕺",
  hiphop: "🎤", metal: "🤘", pop: "🎵", reggae: "🌴", rock: "🎸",
};

export const GENRE_DESC: Record<string, string> = {
  blues: "Soulful & expressive", classical: "Orchestral & timeless",
  country: "Roots & storytelling", disco: "Groovy & danceable",
  hiphop: "Rhythmic & lyrical", metal: "Heavy & powerful",
  pop: "Catchy & melodic", reggae: "Laid-back & rhythmic",
  rock: "Energetic & electric",
};

// Pastel-friendly badge colors for each genre (used as inline styles)
export const GENRE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blues:     { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
  classical: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  country:   { bg: "#fef9c3", text: "#854d0e", border: "#fde68a" },
  disco:     { bg: "#fce7f3", text: "#9d174d", border: "#f9a8d4" },
  hiphop:    { bg: "#f3e8ff", text: "#6b21a8", border: "#d8b4fe" },
  metal:     { bg: "#f1f5f9", text: "#334155", border: "#cbd5e1" },
  pop:       { bg: "#ffe4e6", text: "#9f1239", border: "#fca5a5" },
  reggae:    { bg: "#dcfce7", text: "#166534", border: "#86efac" },
  rock:      { bg: "#ffedd5", text: "#9a3412", border: "#fdba74" },
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
