import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  FolderGit2,
  Sparkles,
  Wand2,
} from "lucide-react";

import { GeminiSettingsForm } from "@/components/site/gemini-settings-form";
import { WorkflowNodeIcon } from "@/components/workflow/node-icon";
import type { WorkflowRecord } from "@/lib/workflow/types";
import { formatTimestamp } from "@/lib/utils";

export function DashboardShell({
  workflows,
}: {
  workflows: WorkflowRecord[];
}) {
  const latestWorkflow = workflows[0];
  const primaryWorkflow =
    workflows.find((workflow) => workflow.id === "product-marketing-kit") ?? latestWorkflow;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f1e7_0%,#efe4d2_100%)] px-6 py-8 text-[#11110f]">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_308px]">
          <section className="rounded-[36px] border border-black/8 bg-[radial-gradient(circle_at_top_left,rgba(13,74,70,0.13),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.62))] p-6 shadow-[0_24px_70px_-34px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#7f6e5a]">Canvas overview</p>
                <h1 className="mt-3 text-4xl font-semibold leading-[1.02]">Run production-ready AI flows from one compact control room.</h1>
                <p className="mt-3 text-sm leading-7 text-[#5e564c]">
                  The dashboard now centers the workflow canvas so the product immediately feels builder-driven, while keeping workflows, docs, and launch actions within reach.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href="/dashboard/new"
                  className="inline-flex items-center rounded-full bg-[#11110f] px-4 py-2.5 text-xs font-medium text-[#f6f0e5] transition hover:bg-[#0d4a46]"
                >
                  New workflow
                  <Wand2 className="ml-2 h-3.5 w-3.5" />
                </Link>
                {primaryWorkflow ? (
                  <Link
                    href={`/workflows/${primaryWorkflow.id}`}
                    className="inline-flex items-center rounded-full border border-[#c9bcab] px-4 py-2.5 text-xs font-medium text-[#201d19] transition hover:border-[#11110f]"
                  >
                    Open latest
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="mt-6 rounded-[30px] border border-black/8 bg-[#0b0c12] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_238px]">
                <div className="rounded-[26px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(117,98,255,0.08),transparent_40%),linear-gradient(180deg,#151621,#0c0d14)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Primary workflow</p>
                      <h2 className="mt-1 text-sm font-semibold text-white">{primaryWorkflow?.name ?? "New workflow"}</h2>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                      <Sparkles className="h-3 w-3 text-[#8f86ff]" />
                      canvas preview
                    </div>
                  </div>
                  <div className="relative mt-4 h-[430px] overflow-hidden rounded-[24px] border border-white/8 bg-[#0d0f17]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(117,98,255,0.08),transparent_35%)]" />
                    {(primaryWorkflow?.graph.nodes ?? []).map((node) => (
                      <div
                        key={node.id}
                        className="absolute rounded-[16px] border border-white/8 bg-[linear-gradient(180deg,rgba(36,36,48,0.94),rgba(18,18,25,0.94))] px-3 py-2.5 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.8)]"
                        style={{
                          left: Math.max(18, node.position.x * 0.34),
                          top: Math.max(18, node.position.y * 0.3),
                          width: 122,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.06] text-[#8f86ff]">
                            <WorkflowNodeIcon kind={node.data.nodeType} className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold leading-4 text-white">{node.data.title}</p>
                            <p className="text-[9px] text-zinc-500">{node.data.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="absolute bottom-4 right-4 flex h-20 w-20 items-center justify-center rounded-[20px] border border-white/8 bg-black/35">
                      <div className="grid grid-cols-3 gap-1.5">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <span
                            key={index}
                            className="h-4 w-4 rounded-sm bg-[#7d6cff]"
                            style={{ opacity: 1 - index * 0.1 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-[24px] border border-black/8 bg-white/75 p-4">
                    <FolderGit2 className="h-4 w-4 text-[#0d4a46]" />
                    <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#7f6e5a]">Workflows</p>
                    <p className="mt-1.5 text-2xl font-semibold">{workflows.length}</p>
                  </div>
                  <div className="rounded-[24px] border border-black/8 bg-white/75 p-4">
                    <Clock3 className="h-4 w-4 text-[#0d4a46]" />
                    <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#7f6e5a]">Last updated</p>
                    <p className="mt-1.5 text-sm font-semibold">{latestWorkflow ? formatTimestamp(latestWorkflow.updatedAt) : "Just now"}</p>
                  </div>
                  <div className="rounded-[24px] border border-black/8 bg-[#17332e] p-4 text-[#f6f0e5]">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#9fbaae]">Product actions</p>
                    <div className="mt-3 grid gap-2.5">
                      <Link
                        href="/docs"
                        className="rounded-[16px] border border-white/10 bg-white/5 px-3 py-2.5 text-[11px] leading-5 text-[#dce6df] transition hover:bg-white/8"
                      >
                        Read docs and environment setup
                      </Link>
                      <Link
                        href="/contact"
                        className="rounded-[16px] border border-white/10 bg-white/5 px-3 py-2.5 text-[11px] leading-5 text-[#dce6df] transition hover:bg-white/8"
                      >
                        Talk to the team about onboarding or deployment
                      </Link>
                      <Link
                        href="/dashboard/new"
                        className="rounded-[16px] border border-white/10 bg-white/5 px-3 py-2.5 text-[11px] leading-5 text-[#dce6df] transition hover:bg-white/8"
                      >
                        Create a new workflow
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4">
            <div className="rounded-[30px] border border-black/8 bg-white/68 p-4 shadow-[0_24px_60px_-38px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#7f6e5a]">Workflow library</p>
                  <h2 className="mt-2 text-lg font-semibold">Your workflows</h2>
                </div>
                <Link href="/dashboard/new" className="text-xs font-medium text-[#0d4a46]">
                  Create new
                </Link>
              </div>
              <div className="mt-4 grid gap-3">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="rounded-[22px] border border-black/8 bg-[#fcfaf6] p-4 transition hover:border-[#0d4a46]/35"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#17332e] text-[#f6f0e5]">
                        <WorkflowNodeIcon kind={workflow.id === "product-marketing-kit" ? "llm" : "text"} className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{workflow.name}</p>
                        <p className="mt-1 text-[11px] leading-5 text-[#5e564c]">
                          {workflow.graph.metadata.description ?? "Node-based workflow ready for multimodal automation."}
                        </p>
                        <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#7f6e5a]">
                          Updated {formatTimestamp(workflow.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`/workflows/${workflow.id}`}
                        className="inline-flex items-center rounded-full bg-[#11110f] px-3 py-2 text-[11px] font-medium text-[#f6f0e5] transition hover:bg-[#0d4a46]"
                      >
                        Open builder
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="gemini-key">
              <GeminiSettingsForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
