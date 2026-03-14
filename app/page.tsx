import Link from "next/link";
import { ArrowRight, Bot, Globe2, LayoutTemplate, ShieldCheck, Sparkles, Workflow } from "lucide-react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getAuthState } from "@/lib/server/auth";

const featureCards = [
  {
    icon: Workflow,
    title: "Visual workflow editor",
    description: "Compose LLM, media, and prompt steps in a clean graph interface built for repeatable execution.",
  },
  {
    icon: Bot,
    title: "Multimodal AI flows",
    description: "Route text, images, and video outputs into Gemini-ready prompts and downstream media tasks.",
  },
  {
    icon: ShieldCheck,
    title: "Production-ready foundation",
    description: "Authentication, persistence, run history, and deployment-friendly structure are built into the product shell.",
  },
];

const productSections = [
  {
    eyebrow: "For operators",
    title: "Move from prompt experiments to reusable internal tools.",
    copy:
      "NEXTflow gives product teams, growth teams, and operations teams a visual way to standardize AI work instead of rebuilding the same prompt chain every week.",
  },
  {
    eyebrow: "For builders",
    title: "Keep the orchestration logic visible.",
    copy:
      "Node-level execution, typed handles, and run history make it easier to explain, debug, and ship AI processes with confidence.",
  },
  {
    eyebrow: "For companies",
    title: "Host your own branded workflow product.",
    copy:
      "The editor is now wrapped in a proper website with navigation, docs, contact, auth pages, and a dashboard so it works like a real SaaS product.",
  },
];

export default async function HomePage() {
  const authState = await getAuthState();

  return (
    <div className="min-h-screen bg-[#f7f1e7] text-[#11110f]">
      <SiteHeader signedIn={authState.isSignedIn} currentPath="/" />
      <main>
        <section className="overflow-hidden px-6 pb-20 pt-10">
          <div className="mx-auto grid max-w-7xl gap-10 rounded-[40px] bg-[radial-gradient(circle_at_top_left,rgba(13,74,70,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(37,126,109,0.1),transparent_26%),linear-gradient(180deg,#f3eadc,#efe1cc)] p-8 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.25)] lg:grid-cols-[1.15fr_0.85fr] lg:p-12">
            <div>
              <div className="inline-flex rounded-full border border-black/8 bg-white/60 px-4 py-1 text-[11px] uppercase tracking-[0.3em] text-[#7f6e5a]">
                AI workflow platform
              </div>
              <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.98] sm:text-6xl">
                Turn prompt chains into a hosted product your team can actually use.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5e564c]">
                NEXTflow is a modern workflow product for designing, running, and tracking multimodal AI automations. Start on the landing page, sign in, and land in a dashboard built for real usage instead of a demo-only canvas.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={authState.isSignedIn ? "/dashboard" : "/sign-up"}
                  className="inline-flex items-center rounded-full bg-[#11110f] px-5 py-3 text-sm font-medium text-[#f6f0e5] transition hover:bg-[#0d4a46]"
                >
                  {authState.isSignedIn ? "Go to dashboard" : "Start free"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center rounded-full border border-[#c9bcab] px-5 py-3 text-sm font-medium text-[#201d19] transition hover:border-[#11110f]"
                >
                  Explore docs
                </Link>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {featureCards.map((feature) => (
                  <div key={feature.title} className="rounded-[28px] border border-black/8 bg-white/65 p-5">
                    <feature.icon className="h-6 w-6 text-[#0d4a46]" />
                    <p className="mt-4 text-base font-semibold">{feature.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[#5e564c]">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-[32px] border border-black/8 bg-[#17332e] p-6 text-[#f6f0e5]">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#9fbaae]">What ships with the product</p>
                <div className="mt-6 grid gap-4">
                  {[
                    "Landing page with product messaging and conversion flow",
                    "Dedicated docs and contact sections",
                    "Sign-in and sign-up entry points",
                    "Dashboard before the builder",
                    "Workflow editor and execution system behind auth",
                  ].map((item) => (
                    <div key={item} className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[32px] border border-black/8 bg-white/72 p-6">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#7f6e5a]">Why teams use it</p>
                <div className="mt-5 grid gap-4">
                  {productSections.map((section) => (
                    <div key={section.title} className="rounded-[24px] border border-black/8 bg-[#fcfaf6] p-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#0d4a46]">{section.eyebrow}</p>
                      <p className="mt-3 text-lg font-semibold">{section.title}</p>
                      <p className="mt-2 text-sm leading-7 text-[#5e564c]">{section.copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto max-w-7xl rounded-[40px] border border-black/8 bg-white/60 p-8 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.2)] lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#7f6e5a]">Platform surface</p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight">A complete user journey, not just an editor route.</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    icon: Globe2,
                    title: "Website first",
                    description: "Public product pages tell the story before users ever touch the workflow builder.",
                  },
                  {
                    icon: LayoutTemplate,
                    title: "Dashboard second",
                    description: "Authenticated users land in a workspace hub where they manage workflows before entering the editor.",
                  },
                  {
                    icon: Sparkles,
                    title: "Product polish",
                    description: "The visual language is branded around NEXTflow and feels like a standalone product from the first screen.",
                  },
                  {
                    icon: Workflow,
                    title: "Execution visibility",
                    description: "The builder still carries the node graph, run states, history, and export/import functionality.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-[28px] border border-black/8 bg-[#fcfaf6] p-5">
                    <item.icon className="h-5 w-5 text-[#0d4a46]" />
                    <p className="mt-4 text-lg font-semibold">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[#5e564c]">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
