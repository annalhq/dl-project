"use client";

export default function HeroSection() {
  return (
    <div className="py-16 lg:py-24 animate-fade-up relative">
      {/* Subtle gradient glow behind hero */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[300px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative text-center max-w-3xl mx-auto px-4">


        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter mb-6 leading-[0.9]">
          <span className="text-base-content">Sound</span>
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Sort</span>
        </h1>

        <p className="text-base-content/70 text-lg sm:text-xl font-normal mb-10 max-w-2xl mx-auto leading-relaxed">
          Classify your music library instantly. Upload MP3 files and our CNN model reveals the genre structure of your audio collection.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <div className="badge badge-lg badge-outline gap-2 px-4 py-3 text-base-content/70 border-base-content/15 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
            </svg>
            Spectrogram Analysis
          </div>
          <div className="badge badge-lg badge-outline gap-2 px-4 py-3 text-base-content/70 border-base-content/15 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-secondary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
            </svg>
            Batch Processing
          </div>
          <div className="badge badge-lg badge-outline gap-2 px-4 py-3 text-base-content/70 border-base-content/15 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-accent">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
            </svg>
            9 Genre Classes
          </div>
        </div>
      </div>
    </div>
  );
}
