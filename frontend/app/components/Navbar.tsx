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
    <nav className="navbar bg-base-100 shadow-sm px-4 lg:px-8 sticky top-0 z-50">
      <div className="navbar-start">
        <span className="text-xl font-extrabold tracking-tight flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <span>SoundSort</span>
        </span>
      </div>

      <div className="navbar-center hidden sm:flex">
        <span className="badge badge-primary badge-outline badge-sm font-medium gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.784l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .784.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.784l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684Z" />
          </svg>
          CNN Powered
        </span>
      </div>

      <div className="navbar-end">
        <div className="flex items-center gap-2 text-xs font-medium">
          {backendUp === null ? (
            <span className="text-base-content/50">Checking...</span>
          ) : backendUp ? (
            <>
              <span className="status status-success status-sm"></span>
              <span className="text-success">API Online</span>
            </>
          ) : (
            <>
              <span className="status status-error status-sm"></span>
              <span className="text-error">API Offline</span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
