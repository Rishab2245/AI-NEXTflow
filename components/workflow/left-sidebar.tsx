"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { WorkflowNodeIcon } from "@/components/workflow/node-icon";
import { nodeCatalog } from "@/lib/workflow/defaults";
import { useWorkflowStore } from "@/components/workflow/store";

export function LeftSidebar() {
  const addNode = useWorkflowStore((state) => state.addNode);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const lowercase = query.toLowerCase();
    return nodeCatalog.filter((entry) => {
      return [entry.title, entry.subtitle, entry.description].some((value) =>
        value.toLowerCase().includes(lowercase),
      );
    });
  }, [query]);

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-[28px] border border-white/10 bg-black/35 p-3 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Quick Access</p>
          <h2 className="mt-1.5 text-base font-semibold text-white">Node Library</h2>
        </div>
      </div>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search node types"
          className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 text-xs text-white outline-none placeholder:text-zinc-500 focus:border-[#8076ff]"
        />
      </div>
      <div className="grid gap-2.5 overflow-y-auto pr-1">
        {filtered.map((entry) => (
          <button
            key={entry.kind}
            onClick={() => addNode(entry.kind)}
            className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-3 text-left transition hover:border-[#7b70ff]/50 hover:bg-white/[0.08]"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-[#8f86ff]">
                <WorkflowNodeIcon kind={entry.kind} className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-white">{entry.title}</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[#8f86ff]">{entry.subtitle}</div>
              </div>
            </div>
            <p className="mt-2.5 text-[11px] leading-5 text-zinc-400">{entry.description}</p>
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-3">
        <p className="text-xs font-medium text-white">Quick note</p>
        <p className="mt-1.5 text-[11px] leading-5 text-zinc-400">
          Build with compact node controls, clean type-safe connections, and responsive side panels.
        </p>
        <Button variant="primary" className="mt-3 w-full" onClick={() => addNode("llm")}>
          Add LLM Node
        </Button>
      </div>
    </aside>
  );
}
