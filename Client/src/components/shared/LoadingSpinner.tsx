"use client";

import React from "react";

/** Page-level loading spinner (Interviewify "I" style). Wrap in a flex-centered container for full-page use. */
export function LoadingSpinner() {
  return (
    <div className="relative h-16 w-16">
      <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-[var(--accent)] animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center text-[var(--accent)] font-black text-xs">
        I
      </div>
    </div>
  );
}
