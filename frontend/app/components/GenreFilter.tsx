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
  return (
    <div className="flex flex-wrap gap-2 animate-fade-up">
      <button
        className={`btn btn-sm font-mono text-[10px] uppercase tracking-widest ${
          activeGenre === null 
            ? "btn-primary" 
            : "btn-outline border-base-content/20 text-base-content/60"
        }`}
        onClick={() => onSelect(null)}
      >
        All
        <div className={`badge badge-xs ml-1 ${activeGenre === null ? 'badge-primary-content' : 'badge-ghost'}`}>
          {Object.values(genreCounts).reduce((a, b) => a + b, 0)}
        </div>
      </button>

      {genres.map((g) => (
        <button
          key={g}
          className={`btn btn-sm font-mono text-[10px] uppercase tracking-widest ${
            activeGenre === g
              ? "btn-primary"
              : "btn-outline border-base-content/20 text-base-content/60"
          }`}
          onClick={() => onSelect(activeGenre === g ? null : g)}
        >
          {g}
          <div className={`badge badge-xs ml-1 ${activeGenre === g ? 'badge-primary-content' : 'badge-ghost'}`}>
            {genreCounts[g] ?? 0}
          </div>
        </button>
      ))}
    </div>
  );
}
