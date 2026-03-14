"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-20 w-full rounded-xl border border-white/10 bg-black/20 px-2.5 py-2 text-[11px] leading-5 text-white outline-none transition placeholder:text-zinc-500 focus:border-[#8076ff]",
        "disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.03] disabled:text-zinc-500",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
