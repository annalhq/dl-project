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
        className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest rounded border transition-colors ${
          activeGenre === null 
            ? "border-base-content bg-base-content text-base-100" 
            : "border-base-content/10 bg-transparent text-base-content/60 hover:border-base-content/30"
        }`}
        onClick={() => onSelect(null)}
      >
        All
        <span className="ml-2 font-mono opacity-50">
          [{Object.values(genreCounts).reduce((a, b) => a + b, 0)}]
        </span>
      </button>
      {genres.map((g) => (
        <button
          key={g}
          className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest rounded border transition-colors ${
            activeGenre === g
              ? "border-base-content bg-base-content text-base-100"
              : "border-base-content/10 bg-transparent text-base-content/60 hover:border-base-content/30"
          }`}
          onClick={() => onSelect(activeGenre === g ? null : g)}
        >
          {g}
          <span className="ml-2 font-mono opacity-50">
            [{genreCounts[g] ?? 0}]
          </span>
        </button>
      ))}
    </div>
  );
}
