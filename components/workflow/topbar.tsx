"use client";

import Link from "next/link";
import { Download, Import, Redo2, Save, Undo2, UploadCloud } from "lucide-react";
import { useRef } from "react";

import { AccountButton } from "@/components/site/account-button";
import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/components/workflow/store";

export function Topbar({
  onSave,
  onRun,
  onExport,
  onImport,
}: {
  onSave: () => void;
  onRun: (scope: "full" | "selected" | "single") => void;
  onExport: () => void;
  onImport: (file: File) => void;
}) {
  const graph = useWorkflowStore((state) => state.graph);
  const undo = useWorkflowStore((state) => state.undo);
  const redo = useWorkflowStore((state) => state.redo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCount = graph.nodes.filter((node) => node.selected).length;

  return (
    <div className="flex flex-col gap-2.5 rounded-[26px] border border-white/10 bg-black/35 p-3 backdrop-blur-xl xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Workspace</p>
        <h1 className="mt-1.5 text-xl font-semibold leading-tight text-white">{graph.metadata.name}</h1>
        <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-400">
          Protected workflow builder with persistence, execution controls, and inline node results.
        </p>
        <Link href="/dashboard" className="mt-2 inline-flex text-xs font-medium text-[#8f86ff] transition hover:text-white">
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Button variant="ghost" onClick={undo}>
          <Undo2 className="mr-2 h-4 w-4" />
          Undo
        </Button>
        <Button variant="ghost" onClick={redo}>
          <Redo2 className="mr-2 h-4 w-4" />
          Redo
        </Button>
        <Button onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button variant="primary" onClick={() => onRun("full")}>
          <UploadCloud className="mr-2 h-4 w-4" />
          Run All
        </Button>
        <Button onClick={() => onRun("selected")} disabled={selectedCount === 0}>
          Run Selected
        </Button>
        <Button onClick={() => onRun("single")} disabled={selectedCount === 0}>
          Run Single
        </Button>
        <Button onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button onClick={() => fileInputRef.current?.click()}>
          <Import className="mr-2 h-4 w-4" />
          Import
        </Button>
        <AccountButton className="h-9 w-9 border-white/12 bg-white/[0.04]" />
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImport(file);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
