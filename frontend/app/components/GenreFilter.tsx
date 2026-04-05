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
        className={`btn btn-sm ${
          activeGenre === null ? "btn-primary" : "btn-ghost"
        }`}
        onClick={() => onSelect(null)}
      >
        All
        <span className="badge badge-sm badge-ghost ml-1">
          {Object.values(genreCounts).reduce((a, b) => a + b, 0)}
        </span>
      </button>
      {genres.map((g) => (
        <button
          key={g}
          className={`btn btn-sm capitalize ${
            activeGenre === g ? "btn-primary" : "btn-ghost"
          }`}
          onClick={() => onSelect(activeGenre === g ? null : g)}
        >
          {g}
          <span className="badge badge-sm badge-ghost ml-1">
            {genreCounts[g] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
