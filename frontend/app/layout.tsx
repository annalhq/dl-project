import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "SoundSort — AI Music Genre Classifier",
  description:
    "Upload multiple MP3 files and let our CNN model instantly classify each song into one of 9 music genres. Perfect for audition sorting, playlist curation, and music organization.",
  keywords: ["music genre", "AI classifier", "CNN", "MP3", "machine learning"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="corporate"
      className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} h-full`}
    >
      <body className="min-h-full antialiased app-shell-bg text-base-content">
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <footer className="footer footer-center border-t border-base-300/60 bg-base-100/75 p-6 text-xs text-base-content/70 backdrop-blur-sm">
          <div className="gap-1">
            <p>
              Built with <span className="font-semibold text-primary">CNN</span>{" "}
              · <span className="font-semibold text-secondary">FastAPI</span> ·{" "}
              <span className="font-semibold text-accent">Next.js</span> ·{" "}
              <span className="font-semibold text-info">DaisyUI</span>
            </p>
            <p className="font-medium">
              Light-first interface tuned for clarity and fast review loops.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
