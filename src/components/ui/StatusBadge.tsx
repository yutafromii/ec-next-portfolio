"use client";

import { statusColor, toStatusLabel } from "@/lib/status";

export default function StatusBadge({ value, className = "" }: { value?: string | null; className?: string }) {
  const label = toStatusLabel(value);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${statusColor(label)} ${className}`}>
      {label || "—"}
    </span>
  );
}

