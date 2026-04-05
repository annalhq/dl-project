"use client";

import { GENRES } from "../lib/constants";

export default function HeroSection() {
  return (
    <div className="py-16 lg:py-24 animate-fade-up">
      <div className="text-center max-w-3xl mx-auto px-4">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter mb-6 text-base-content">
          Sound<span className="text-neutral-500">Sort</span>
        </h1>

        <p className="text-base-content/70 text-lg sm:text-xl font-light mb-8 max-w-2xl mx-auto">
          High-performance classification. Uncover the structure of your audio intelligence via CNN model inference.
        </p>

        {/* Info pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 text-xs sm:text-sm font-medium text-base-content/50">
          <span className="px-3 py-1 border border-base-content/10 rounded-full">Spectrogram Analysis</span>
          <span className="px-3 py-1 border border-base-content/10 rounded-full">Batch Processing</span>
          <span className="px-3 py-1 border border-base-content/10 rounded-full">10+ Formats Supported</span>
        </div>
      </div>
    </div>
  );
}
