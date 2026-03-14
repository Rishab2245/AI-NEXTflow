import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";
import { SignIn, SignUp } from "@clerk/nextjs";

import { APP_NAME } from "@/lib/constants";
import { isClerkConfigured } from "@/lib/server/auth";

export function AuthCard({ mode }: { mode: "sign-in" | "sign-up" }) {
  if (isClerkConfigured()) {
    return (
      <div className="rounded-[32px] border border-black/8 bg-white/70 p-6 shadow-[0_18px_60px_-32px_rgba(0,0,0,0.3)]">
        {mode === "sign-in" ? (
          <SignIn forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />
        ) : (
          <SignUp forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard" signInUrl="/sign-in" />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-black/8 bg-white/80 p-8 shadow-[0_18px_60px_-32px_rgba(0,0,0,0.3)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#17332e] text-[#f6f0e5]">
        <KeyRound className="h-5 w-5" />
      </div>
      <p className="mt-5 text-[11px] uppercase tracking-[0.28em] text-[#7f6e5a]">Authentication setup required</p>
      <h2 className="mt-3 text-3xl font-semibold text-[#11110f]">
        {mode === "sign-in" ? `Enable Clerk to unlock ${APP_NAME}` : `Finish Clerk setup before sign up`}
      </h2>
      <p className="mt-4 text-sm leading-7 text-[#5e564c]">
        Real authentication is now required for dashboard and workflow access. Add your Clerk publishable key and secret key, then reload this page to use the hosted sign-in and sign-up flows.
      </p>
      <div className="mt-6 rounded-[24px] border border-black/8 bg-[#fcfaf6] p-4">
        <p className="text-xs font-semibold text-[#11110f]">Required env vars</p>
        <pre className="mt-3 overflow-x-auto rounded-2xl bg-[#11110f] p-4 text-[11px] leading-6 text-[#f6f0e5]">
{`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...`}
        </pre>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/docs"
          className="inline-flex items-center rounded-full bg-[#11110f] px-5 py-3 text-sm font-medium text-[#f6f0e5] transition hover:bg-[#0d4a46]"
        >
          Read setup guide
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center rounded-full border border-[#c9bcab] px-5 py-3 text-sm font-medium text-[#201d19] transition hover:border-[#11110f]"
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}
