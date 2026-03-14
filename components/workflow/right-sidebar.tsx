"use client";

import { ChevronDown, Clock3, Layers3, PlayCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { WorkflowNodeIcon } from "@/components/workflow/node-icon";
import { useWorkflowStore } from "@/components/workflow/store";
import { formatDuration, formatTimestamp } from "@/lib/utils";

export function RightSidebar() {
  const runs = useWorkflowStore((state) => state.runs);
  const expandedRunIds = useWorkflowStore((state) => state.expandedRunIds);
  const toggleRunExpanded = useWorkflowStore((state) => state.toggleRunExpanded);

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-[28px] border border-white/10 bg-black/35 p-3 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Workflow History</p>
          <h2 className="mt-1.5 text-base font-semibold text-white">Runs & node details</h2>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
        {runs.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-xs text-zinc-500">
            Run the workflow to populate the execution timeline.
          </div>
        ) : null}
        {runs.map((run) => {
          const expanded = expandedRunIds.includes(run.id);

          return (
            <div key={run.id} className="rounded-[22px] border border-white/8 bg-white/[0.03]">
              <button
                onClick={() => toggleRunExpanded(run.id)}
                className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={run.status}>{run.status}</Badge>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">{run.scope}</span>
                  </div>
                  <p className="text-xs font-medium text-white">Run {run.id}</p>
                  <div className="flex flex-wrap gap-2.5 text-[11px] text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3 w-3" />
                      {formatTimestamp(run.startedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <PlayCircle className="h-3 w-3" />
                      {formatDuration(run.durationMs)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Layers3 className="h-3 w-3" />
                      {run.nodes.length} nodes
                    </span>
                  </div>
                </div>
                <ChevronDown className={`mt-0.5 h-3.5 w-3.5 text-zinc-500 transition ${expanded ? "rotate-180" : ""}`} />
              </button>
              {expanded ? (
                <div className="space-y-2.5 border-t border-white/8 px-3 py-3">
                  {run.nodes.map((node) => (
                    <div key={node.id} className="rounded-[18px] border border-white/8 bg-black/20 p-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-[#8f86ff]">
                            <WorkflowNodeIcon kind={node.nodeType} className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white">{node.nodeLabel}</p>
                            <p className="mt-0.5 text-[10px] text-zinc-500">{node.nodeType}</p>
                          </div>
                        </div>
                        <Badge variant={node.status}>{node.status}</Badge>
                      </div>
                      <div className="mt-2.5 grid gap-2 text-[11px] text-zinc-400">
                        <p>Duration: {formatDuration(node.durationMs)}</p>
                        {node.inputs ? (
                          <pre className="overflow-x-auto rounded-xl bg-black/30 p-2.5 text-[10px] text-zinc-300">
                            {JSON.stringify(node.inputs, null, 2)}
                          </pre>
                        ) : null}
                        {node.outputs ? (
                          <pre className="overflow-x-auto rounded-xl bg-black/30 p-2.5 text-[10px] text-zinc-300">
                            {JSON.stringify(node.outputs, null, 2)}
                          </pre>
                        ) : null}
                        {node.error ? <p className="text-red-300">{node.error}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
