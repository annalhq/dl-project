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
    <nav className="navbar sticky top-0 z-50 border-b border-base-300/70 bg-base-100/80 px-4 shadow-sm backdrop-blur-md lg:px-8">
      <div className="navbar-start">
        <span className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="rounded-xl bg-primary/10 p-1.5 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .456.122Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span className="text-md uppercase tracking-widest text-base-content">
            Sound<span className="font-black text-primary">Sort</span>
          </span>
        </span>
      </div>

      <div className="navbar-center hidden sm:flex">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/50">
          CNN Audio Intelligence
        </span>
      </div>

      <div className="navbar-end">
        <div
          className="flex items-center gap-2 text-xs font-medium"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          {backendUp === null ? (
            <span className="badge badge-outline badge-info tracking-[0.18em] text-[10px]">
              CHECKING
            </span>
          ) : backendUp ? (
            <span className="badge badge-success badge-soft tracking-[0.18em] text-[10px] gap-1 border-success/30">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              ONLINE
            </span>
          ) : (
            <span className="badge badge-error badge-soft tracking-[0.18em] text-[10px] gap-1 border-error/25">
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
              OFFLINE
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
