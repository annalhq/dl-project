"use client";

import { useEffect, useState } from "react";
import { Music, Loader2, Wifi, WifiOff } from "lucide-react";
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
    <nav className="top-0 z-50 w-full">
      {/* Glassmorphism container */}
      <div className="relative mx-auto max-w-7xl px-4 pt-3 lg:px-8">
        <div
          className="relative overflow-hidden rounded-2xl border border-white/[0.08]
                     bg-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                     [backdrop-filter:blur(24px)_saturate(180%)]
                     [-webkit-backdrop-filter:blur(24px)_saturate(180%)]"
        >
          {/* Subtle top-edge light reflection */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px
                       bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />

          {/* Inner content */}
          <div className="flex items-center justify-between px-4 py-2.5 lg:px-5">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="relative flex h-9 w-9 items-center justify-center rounded-xl
                           bg-gradient-to-br from-primary/25 to-primary/5
                           ring-1 ring-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <Music className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold tracking-tight leading-none text-base-content">
                  Sound<span className="text-primary">Sort</span>
                </span>
                <span className="hidden sm:block text-[10px] font-medium tracking-[0.16em] uppercase text-base-content/30 mt-0.5">
                  Audio Intelligence
                </span>
              </div>
            </div>

            {/* Center label — desktop only */}
            <div className="hidden md:flex items-center gap-2">
              <div className="h-4 w-px bg-base-content/[0.08]" />
              <span className="text-[11px] font-mono tracking-[0.18em] uppercase text-base-content/30 select-none">
                CNN Audio Intelligence
              </span>
              <div className="h-4 w-px bg-base-content/[0.08]" />
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2.5">
              {backendUp === null ? (
                <div
                  className="flex items-center gap-2 rounded-lg border border-base-content/[0.06]
                             bg-white/[0.03] px-3 py-1.5"
                >
                  <Loader2 className="h-3 w-3 animate-spin text-base-content/40" />
                  <span className="text-[11px] font-mono font-medium text-base-content/40">
                    Checking
                  </span>
                </div>
              ) : backendUp ? (
                <div
                  className="flex items-center gap-2 rounded-lg border border-emerald-500/15
                             bg-emerald-500/[0.06] px-3 py-1.5"
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full
                                 bg-emerald-400 opacity-50"
                    />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[11px] font-mono font-medium text-emerald-400/90">
                    Online
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 rounded-lg border border-red-500/15
                             bg-red-500/[0.06] px-3 py-1.5"
                >
                  <WifiOff className="h-3 w-3 text-red-400/80" />
                  <span className="text-[11px] font-mono font-medium text-red-400/80">
                    Offline
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Bottom spacing so content below doesn't overlap the floating bar */}
      <div className="h-2" />
    </nav>
  );
}