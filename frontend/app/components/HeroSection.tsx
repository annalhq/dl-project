"use client";

import { GENRES, GENRE_EMOJI } from "../lib/constants";

export default function HeroSection() {
  return (
    <div className="hero py-8 lg:py-10">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
            <span className="text-primary">Sound</span>
            <span className="text-secondary">Sort</span>
          </h1>

          <p className="text-base-content/60 text-base sm:text-lg leading-relaxed mb-1.5">
            Upload your MP3 files and our AI instantly classifies each song into its genre.
          </p>
          <p className="text-base-content/40 text-sm mb-5">
            Perfect for auditions, playlist curation & music organization.
          </p>

          {/* Genre pills */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {GENRES.map((g) => (
              <span
                key={g}
                className="badge badge-outline badge-sm capitalize font-medium"
              >
                {GENRE_EMOJI[g]} {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
