"use client";

export default function HeroSection() {
  return (
    <div className="hero animate-fade-up py-14 lg:py-20">
      <div className="hero-content max-w-4xl px-2 text-center sm:px-4">
        <div>
          <div className="badge badge-outline badge-info mb-4 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
            Batch Audio Genre Classification
          </div>

          <h1 className="mb-5 text-5xl font-black tracking-tight text-base-content sm:text-7xl">
            Sound<span className="text-primary">Sort</span>
          </h1>

          <p className="mx-auto mb-7 max-w-2xl text-lg font-medium text-base-content/75 sm:text-xl">
            Upload tracks, run CNN inference, and review genre patterns through
            a cleaner, light-first dashboard designed for fast decisions.
          </p>

          {/* Info pills */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="badge badge-lg badge-soft badge-primary">
              Spectrogram Analysis
            </span>
            <span className="badge badge-lg badge-soft badge-secondary">
              Batch Processing
            </span>
            <span className="badge badge-lg badge-soft badge-accent">
              Live Progress Stream
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
