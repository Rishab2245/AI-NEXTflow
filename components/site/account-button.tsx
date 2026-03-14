"use client";

import { UserButton } from "@clerk/nextjs";

import { cn } from "@/lib/utils";

export function AccountButton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#c9bcab] bg-white/70 shadow-[0_10px_30px_-20px_rgba(17,17,15,0.45)] backdrop-blur",
        className,
      )}
    >
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-8 w-8 ring-0",
            userButtonTrigger:
              "flex h-8 w-8 items-center justify-center rounded-full focus:shadow-none focus:outline-none",
            userButtonPopoverCard: "border border-black/10 shadow-2xl",
            userButtonPopoverActionButton: "text-sm",
          },
        }}
      />
    </div>
  );
}
