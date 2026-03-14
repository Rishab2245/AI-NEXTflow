import Link from "next/link";

import { AccountButton } from "@/components/site/account-button";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader({
  signedIn,
  currentPath = "/",
}: {
  signedIn: boolean;
  currentPath?: string;
}) {
  const links = [
    { href: "/", label: "Product" },
    { href: "/docs", label: "Docs" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f7f1e7]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0d4a46,#267e6d)] text-sm font-semibold text-[#f6f0e5]">
            NF
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#7f6e5a]">AI workflow platform</p>
            <p className="text-lg font-semibold text-[#11110f]">{APP_NAME}</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-[#4e473f] transition hover:text-[#11110f]",
                currentPath === link.href && "text-[#11110f]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {signedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full border border-[#c9bcab] px-4 py-2 text-sm font-medium text-[#201d19] transition hover:border-[#11110f]"
              >
                Dashboard
              </Link>
              <Link
                href="/workflows/product-marketing-kit"
                className="rounded-full bg-[#11110f] px-4 py-2 text-sm font-medium text-[#f6f0e5] transition hover:bg-[#0d4a46]"
              >
                Open builder
              </Link>
              <AccountButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-full border border-[#c9bcab] px-4 py-2 text-sm font-medium text-[#201d19] transition hover:border-[#11110f]"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-[#11110f] px-4 py-2 text-sm font-medium text-[#f6f0e5] transition hover:bg-[#0d4a46]"
              >
                Start free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
