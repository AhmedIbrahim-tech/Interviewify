"use client";

import React from "react";
import { getQuestionLevelLabel } from "@/constants/questionLevels";
import type { QuestionLevel } from "@/constants/questionLevels";

interface LevelBadgeProps {
  level: QuestionLevel | string | null | undefined;
  className?: string;
  size?: "sm" | "md";
}

/** Displays question level as a subtle pill; works in dark/light mode. */
export function LevelBadge({ level, className = "", size = "md" }: LevelBadgeProps) {
  const label = getQuestionLevelLabel(level);
  if (!label) return null;

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border bg-[var(--surface-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] uppercase tracking-wide ${sizeClass} ${className}`}
      title={`Level: ${label}`}
    >
      {label}
    </span>
  );
}
