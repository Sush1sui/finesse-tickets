"use client";

import React from "react";

export interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export default function Spinner({
  size = 28,
  className,
  label = "Loading",
}: SpinnerProps) {
  const s = Math.max(8, size);
  const stroke = Math.max(2, Math.round(s * 0.14));

  return (
    <div
      role="status"
      aria-label={label}
      className={className}
      style={{
        width: s,
        height: s,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg viewBox="0 0 50 50" style={{ width: s, height: s }}>
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeOpacity="0.12"
        />
        <path
          d="M45 25A20 20 0 0 1 25 5"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
