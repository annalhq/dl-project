"use client";

import { useEffect, useState } from "react";
import { API_HEALTH } from "../lib/constants";

export default function Navbar() {
  const [backendUp, setBackendUp] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(API_HEALTH, {
          signal: AbortSignal.timeout(3000),
        });
        setBackendUp(res.ok);
      } catch {
        setBackendUp(false);
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-base-content/8 bg-base-100/70 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4 text-base-content/60"
          >
            <path
              fillRule="evenodd"
              d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .456.122Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-semibold tracking-widest uppercase text-base-content">
            SoundSort
          </span>
        </div>

        {/* Center label — hidden on mobile */}
        <span className="hidden sm:block text-xs tracking-widest uppercase text-base-content/50 font-medium select-none">
          CNN Audio Intelligence
        </span>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {backendUp === null ? (
            <span className="text-xs font-mono tracking-widest text-base-content/55 uppercase">
              Checking…
            </span>
          ) : backendUp ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-xs font-mono tracking-widest text-base-content/65 uppercase">
                Online
              </span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-error" />
              <span className="text-xs font-mono tracking-widest text-base-content/65 uppercase">
                Offline
              </span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
