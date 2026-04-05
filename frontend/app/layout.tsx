import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" data-theme="black" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased bg-base-200">
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <footer className="footer footer-center bg-base-100 text-base-content/50 p-6 text-xs border-t border-base-300">
          <div>
            <p>
              Built with{" "}
              <span className="font-semibold text-primary">CNN</span> ·{" "}
              <span className="font-semibold text-secondary">FastAPI</span> ·{" "}
              <span className="font-semibold text-accent">Next.js</span> ·{" "}
              <span className="font-semibold text-info">DaisyUI</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
