"use client";

interface GenreFilterProps {
  genres: string[];
  genreCounts: Record<string, number>;
  activeGenre: string | null;
  onSelect: (genre: string | null) => void;
}

export default function GenreFilter({
  genres,
  genreCounts,
  activeGenre,
  onSelect,
}: GenreFilterProps) {
  const total = Object.values(genreCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-wrap items-center gap-2 animate-fade-up">
      <button
        className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-all ${
          activeGenre === null
            ? "border-base-content/80 bg-base-content text-base-100 shadow-sm"
            : "border-base-content/15 bg-base-100 text-base-content/65 hover:border-base-content/35"
        }`}
        onClick={() => onSelect(null)}
      >
        <span>All</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] tracking-wider ${
            activeGenre === null
              ? "bg-base-100/25 text-base-100"
              : "bg-base-200 text-base-content/70"
          }`}
        >
          {total}
        </span>
      </button>

      {genres.map((g) => (
        <button
          key={g}
          className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-all ${
            activeGenre === g
              ? "border-base-content/80 bg-base-content text-base-100 shadow-sm"
              : "border-base-content/15 bg-base-100 text-base-content/65 hover:border-base-content/35"
          }`}
          onClick={() => onSelect(activeGenre === g ? null : g)}
        >
          <span>{g}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] tracking-wider ${
              activeGenre === g
                ? "bg-base-100/25 text-base-100"
                : "bg-base-200 text-base-content/70"
            }`}
          >
            {genreCounts[g] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
