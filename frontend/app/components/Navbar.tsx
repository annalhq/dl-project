"use client";

import { useEffect, useState } from "react";
import { API_HEALTH } from "../lib/constants";

export default function Navbar() {
  const [backendUp, setBackendUp] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(API_HEALTH, { signal: AbortSignal.timeout(3000) });
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
    <nav className="navbar bg-base-100/50 backdrop-blur-md shadow-sm border-b border-base-content/5 px-4 lg:px-8 sticky top-0 z-50">
      <div className="navbar-start">
        <span className="text-xl font-bold tracking-tight flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary">
            <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .456.122Z" clipRule="evenodd" />
          </svg>
          <span className="uppercase text-md tracking-widest text-base-content">Sound<span className="text-primary font-black">Sort</span></span>
        </span>
      </div>

      <div className="navbar-center hidden sm:flex">
        <span className="text-xs uppercase tracking-widest text-base-content/40 font-semibold">
          CNN Audio Intelligence
        </span>
      </div>

      <div className="navbar-end">
        <div className="flex items-center gap-2 text-xs font-mono font-medium">
          {backendUp === null ? (
             <span className="badge badge-neutral tracking-widest font-mono text-[10px]">CHECKING</span>
          ) : backendUp ? (
            <span className="badge badge-success badge-outline tracking-widest font-mono text-[10px] gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              ONLINE
            </span>
          ) : (
            <span className="badge badge-error badge-outline tracking-widest font-mono text-[10px] gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
              OFFLINE
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
