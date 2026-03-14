"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-8.5 w-full rounded-xl border border-white/10 bg-black/20 px-2.5 text-[11px] text-white outline-none transition placeholder:text-zinc-500 focus:border-[#8076ff]",
          "disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.03] disabled:text-zinc-500",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
