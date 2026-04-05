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
    <div className="join join-vertical sm:join-horizontal animate-fade-up">
      <button
        className={`join-item btn btn-sm text-[10px] font-semibold uppercase tracking-[0.18em] ${
          activeGenre === null
            ? "btn-primary"
            : "btn-outline text-base-content/70"
        }`}
        style={{ fontFamily: "var(--font-jetbrains)" }}
        onClick={() => onSelect(null)}
      >
        All
        <div
          className={`badge badge-xs ml-1 ${activeGenre === null ? "badge-neutral" : "badge-ghost"}`}
        >
          {total}
        </div>
      </button>

      {genres.map((g) => (
        <button
          key={g}
          className={`join-item btn btn-sm text-[10px] font-semibold uppercase tracking-[0.16em] ${
            activeGenre === g
              ? "btn-primary"
              : "btn-outline text-base-content/70"
          }`}
          style={{ fontFamily: "var(--font-jetbrains)" }}
          onClick={() => onSelect(activeGenre === g ? null : g)}
        >
          {g}
          <div
            className={`badge badge-xs ml-1 ${activeGenre === g ? "badge-neutral" : "badge-ghost"}`}
          >
            {genreCounts[g] ?? 0}
          </div>
        </button>
      ))}
    </div>
  );
}
