import Link from "next/link";
import { BookOpenText, Boxes, FileCode2, Rocket, Shield } from "lucide-react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getAuthState } from "@/lib/server/auth";

const docCards = [
  {
    icon: BookOpenText,
    title: "Platform overview",
    body: "Understand the product journey from landing page to dashboard to workflow editor.",
  },
  {
    icon: Boxes,
    title: "Workflow model",
    body: "Review the six node types, typed handles, DAG validation, and run scopes.",
  },
  {
    icon: FileCode2,
    title: "Developer setup",
    body: "Configure environment variables, Prisma, Clerk, Gemini, Trigger.dev, and Transloadit.",
  },
  {
    icon: Rocket,
    title: "Deployment",
    body: "Use Vercel plus a hosted PostgreSQL database and production credentials for full behavior.",
  },
];

export default async function DocsPage() {
  const authState = await getAuthState();

  return (
    <div className="min-h-screen bg-[#f7f1e7] text-[#11110f]">
      <SiteHeader signedIn={authState.isSignedIn} currentPath="/docs" />
      <main className="px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <section className="rounded-[40px] border border-black/8 bg-white/70 p-8 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.18)] lg:p-12">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#7f6e5a]">Documentation</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02]">Everything you need to run, extend, and host NEXTflow.</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#5e564c]">
              The docs section is built as part of the product website so users and reviewers can understand the platform before they ever open the editor.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {docCards.map((card) => (
                <div key={card.title} className="rounded-[28px] border border-black/8 bg-[#fcfaf6] p-5">
                  <card.icon className="h-5 w-5 text-[#0d4a46]" />
                  <p className="mt-4 text-lg font-semibold">{card.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[#5e564c]">{card.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[36px] border border-black/8 bg-[#17332e] p-8 text-[#f6f0e5]">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#9fbaae]">Core concepts</p>
              <div className="mt-6 grid gap-4">
                {[
                  "Workflows behave like DAGs. Circular paths are rejected.",
                  "Only type-safe handle connections are allowed between nodes.",
                  "Manual inputs become read-only when connected values are supplied upstream.",
                  "Runs are tracked at both workflow and node level for visibility and debugging.",
                ].map((item) => (
                  <div key={item} className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[36px] border border-black/8 bg-white/68 p-8">
              <Shield className="h-6 w-6 text-[#0d4a46]" />
              <h2 className="mt-5 text-2xl font-semibold">Need the implementation docs too?</h2>
              <p className="mt-3 text-sm leading-7 text-[#5e564c]">
                The repository also includes detailed markdown docs covering the project overview, build approach, setup guide, and deployment notes.
              </p>
              <div className="mt-6 grid gap-3 text-sm text-[#0d4a46]">
                <p>Repository markdown docs are included alongside the app for implementation and deployment reference.</p>
                <Link href="/contact">Need help adopting the platform? Contact us.</Link>
                <Link href="/sign-up">Create an account and open the dashboard.</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
