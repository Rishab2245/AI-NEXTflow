"use client";

import { cn } from "@/lib/utils";

const badgeColors = {
  idle: "bg-white/[0.06] text-zinc-300",
  queued: "bg-amber-500/15 text-amber-200",
  running: "bg-yellow-500/15 text-yellow-200",
  success: "bg-emerald-500/15 text-emerald-200",
  failed: "bg-red-500/15 text-red-200",
  skipped: "bg-zinc-500/15 text-zinc-300",
};

export function Badge({
  children,
  variant = "idle",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof badgeColors;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em]",
        badgeColors[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
