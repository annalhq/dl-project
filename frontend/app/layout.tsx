import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SoundSort — AI Music Genre Classifier",
  description:
    "Upload MP3 files and let our CNN model instantly classify each song into one of 9 music genres. Built for audition sorting, playlist curation, and music organization.",
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
      data-theme="dark"
      className={`${inter.variable} ${jetbrains.variable} h-full`}
    >
      <body className="min-h-full antialiased bg-base-300 text-base-content">
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>

      </body>
    </html>
  );
}
