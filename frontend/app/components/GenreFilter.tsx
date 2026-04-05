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
      {/* All filter */}
      <button
        className={`btn btn-sm gap-2 font-medium text-xs transition-all ${
          activeGenre === null
            ? "btn-primary"
            : "btn-ghost border border-base-content/10 text-base-content/60 hover:text-base-content hover:bg-base-content/5"
        }`}
        onClick={() => onSelect(null)}
      >
        All
        <span className={`badge badge-xs font-mono tabular-nums ${
          activeGenre === null
            ? "badge-primary-content bg-primary-content/20 text-primary-content"
            : "badge-ghost text-base-content/50"
        }`}>
          {total}
        </span>
      </button>

      {genres.map((g) => (
        <button
          key={g}
          className={`btn btn-sm gap-2 font-medium text-xs uppercase transition-all ${
            activeGenre === g
              ? "btn-primary"
              : "btn-ghost border border-base-content/10 text-base-content/60 hover:text-base-content hover:bg-base-content/5"
          }`}
          onClick={() => onSelect(activeGenre === g ? null : g)}
        >
          {g}
          <span className={`badge badge-xs font-mono tabular-nums ${
            activeGenre === g
              ? "badge-primary-content bg-primary-content/20 text-primary-content"
              : "badge-ghost text-base-content/50"
          }`}>
            {genreCounts[g] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
