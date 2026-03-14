import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-[#f7f1e7]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-[#7f6e5a]">Built for teams shipping with AI</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#11110f]">{APP_NAME}</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#5e564c]">
            Design, run, and track multimodal workflows with a clean node-based interface, production-minded orchestration, and a product-first experience.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#11110f]">Explore</p>
          <div className="mt-4 grid gap-3 text-sm text-[#5e564c]">
            <Link href="/">Product</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#11110f]">Get started</p>
          <div className="mt-4 grid gap-3 text-sm text-[#5e564c]">
            <Link href="/sign-in">Log in</Link>
            <Link href="/sign-up">Create account</Link>
            <Link href="/workflows/product-marketing-kit">Open sample workflow</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
