import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
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
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
