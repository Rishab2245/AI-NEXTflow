"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = {
  primary:
    "bg-[linear-gradient(135deg,#7562ff_0%,#5a49d6_55%,#4335b0_100%)] text-white shadow-[0_18px_50px_-22px_rgba(90,73,214,0.7)] hover:brightness-110",
  secondary:
    "border border-white/12 bg-white/[0.04] text-white hover:border-white/25 hover:bg-white/[0.08]",
  ghost: "text-zinc-300 hover:bg-white/[0.06] hover:text-white",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-xl px-3.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7f73ff]",
          "disabled:cursor-not-allowed disabled:opacity-45",
          buttonVariants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
