"use client";

import { GENRES } from "../lib/constants";

export default function HeroSection() {
  return (
    <div className="hero py-16 lg:py-24 animate-fade-up">
      <div className="hero-content text-center max-w-3xl px-4">
        <div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-6 text-base-content">
            Sound<span className="text-primary">Sort</span>
          </h1>

          <p className="text-base-content/80 text-lg sm:text-xl font-medium mb-8 max-w-2xl mx-auto">
            High-performance classification. Uncover the structure of your audio intelligence via CNN model inference.
          </p>

          {/* Info pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <span className="badge badge-lg badge-outline">Spectrogram Analysis</span>
            <span className="badge badge-lg badge-outline">Batch Processing</span>
            <span className="badge badge-lg badge-outline">10+ Formats Supported</span>
          </div>
        </div>
      </div>
    </div>
  );
}
