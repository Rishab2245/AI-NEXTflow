"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WorkflowNodeIcon } from "@/components/workflow/node-icon";
import { nodeHandles } from "@/lib/workflow/defaults";
import { isInputConnected } from "@/lib/workflow/graph";
import type { WorkflowNode, WorkflowNodeData } from "@/lib/workflow/types";
import { cn } from "@/lib/utils";
import { useWorkflowStore } from "@/components/workflow/store";

function NodeShell({
  data,
  children,
}: {
  data: WorkflowNodeData;
  children: React.ReactNode;
}) {
  const inputs = nodeHandles[data.nodeType].filter((handle) => handle.kind === "input");
  const outputs = nodeHandles[data.nodeType].filter((handle) => handle.kind === "output");

  return (
    <div
      className={cn(
        "relative w-[264px] rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(32,32,42,0.96),rgba(16,16,22,0.96))] p-3 shadow-[0_24px_80px_-35px_rgba(0,0,0,0.9)] backdrop-blur-xl",
        data.runState?.status === "running" &&
          "animate-[pulse_1.8s_ease-in-out_infinite] shadow-[0_0_0_1px_rgba(117,98,255,0.7),0_0_34px_rgba(117,98,255,0.42)]",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-[#9e94ff]">
            <WorkflowNodeIcon kind={data.nodeType} className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[13px] font-semibold leading-4 text-white">{data.title}</div>
            <div className="mt-0.5 text-[10px] text-zinc-400">{data.subtitle}</div>
          </div>
        </div>
        <Badge variant={data.runState?.status ?? "idle"}>{data.runState?.status ?? "idle"}</Badge>
      </div>
      {children}
      {data.runState?.errorMessage ? (
        <p className="mt-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-2.5 py-2 text-[11px] text-red-200">
          {data.runState.errorMessage}
        </p>
      ) : null}
      {inputs.map((handle, index) => (
        <div
          key={handle.id}
          className="absolute left-0 flex -translate-x-1/2 items-center gap-2"
          style={{ top: 66 + index * 44 }}
        >
          <Handle
            type="target"
            position={Position.Left}
            id={handle.id}
            className="!relative !left-0 !top-0 !h-3 !w-3 !translate-y-0 !border-2 !border-[#15151f] !bg-[#2d2f38]"
          />
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-zinc-500">
            {handle.label}
          </span>
        </div>
      ))}
      {outputs.map((handle, index) => (
        <div
          key={handle.id}
          className="absolute right-0 flex translate-x-1/2 items-center gap-2"
          style={{ top: 84 + index * 44 }}
        >
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-zinc-500">
            {handle.label}
          </span>
          <Handle
            type="source"
            position={Position.Right}
            id={handle.id}
            className="!relative !right-0 !top-0 !h-3 !w-3 !translate-y-0 !border-2 !border-[#15151f] !bg-[#7f73ff]"
          />
        </div>
      ))}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-full bg-white/10" />
    </div>
  );
}

function Field({
  label,
  disabled,
  hint,
  children,
}: {
  label: string;
  disabled?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-[10px] text-zinc-400">
      <div className="flex items-center justify-between gap-2 uppercase tracking-[0.15em]">
        <span>{label}</span>
        {disabled ? <span className="text-[9px] text-zinc-500">Connected</span> : null}
      </div>
      {children}
      {hint ? <span className="text-[10px] text-zinc-500">{hint}</span> : null}
    </label>
  );
}

function SourcePreview({
  url,
  kind,
}: {
  url?: string;
  kind: "image" | "video";
}) {
  if (!url) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-black/20 px-3 py-4 text-center text-[11px] text-zinc-500">
        Upload or paste a media URL to preview it here.
      </div>
    );
  }

  if (kind === "image") {
    return (
      <div className="relative h-24 w-full overflow-hidden rounded-xl">
        <Image src={url} alt="" fill unoptimized className="object-cover" />
      </div>
    );
  }

  return <video src={url} controls className="h-24 w-full rounded-xl object-cover" />;
}

export function WorkflowNodeComponent({ id, data }: NodeProps<WorkflowNode>) {
  const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);
  const graphEdges = useWorkflowStore((state) => state.graph.edges);
  const systemConnected = isInputConnected(graphEdges, id, "system_prompt");
  const userConnected = isInputConnected(graphEdges, id, "user_message");
  const imageConnected = isInputConnected(graphEdges, id, "images");
  const cropImageConnected = isInputConnected(graphEdges, id, "image_url");
  const xConnected = isInputConnected(graphEdges, id, "x_percent");
  const yConnected = isInputConnected(graphEdges, id, "y_percent");
  const widthConnected = isInputConnected(graphEdges, id, "width_percent");
  const heightConnected = isInputConnected(graphEdges, id, "height_percent");
  const videoConnected = isInputConnected(graphEdges, id, "video_url");
  const timestampConnected = isInputConnected(graphEdges, id, "timestamp");

  if (data.nodeType === "text") {
    const config = data.config as { content: string };
    return (
      <NodeShell data={data}>
        <Field label="Content">
          <Textarea
            value={config.content}
            onChange={(event) => updateNodeConfig(id, { content: event.target.value })}
            placeholder="Write the text payload for downstream nodes."
          />
        </Field>
      </NodeShell>
    );
  }

  if (data.nodeType === "uploadImage") {
    const config = data.config as { imageUrl: string };
    return (
      <NodeShell data={data}>
        <div className="grid gap-3">
          <Field label="Image URL" hint="JPG, JPEG, PNG, WEBP, GIF">
            <Input
              value={config.imageUrl}
              onChange={(event) => updateNodeConfig(id, { imageUrl: event.target.value })}
              placeholder="Paste a Transloadit asset URL or local preview URL"
            />
          </Field>
          <SourcePreview url={config.imageUrl} kind="image" />
        </div>
      </NodeShell>
    );
  }

  if (data.nodeType === "uploadVideo") {
    const config = data.config as { videoUrl: string };
    return (
      <NodeShell data={data}>
        <div className="grid gap-3">
          <Field label="Video URL" hint="MP4, MOV, WEBM, M4V">
            <Input
              value={config.videoUrl}
              onChange={(event) => updateNodeConfig(id, { videoUrl: event.target.value })}
              placeholder="Paste a Transloadit asset URL or local preview URL"
            />
          </Field>
          <SourcePreview url={config.videoUrl} kind="video" />
        </div>
      </NodeShell>
    );
  }

  if (data.nodeType === "llm") {
    const config = data.config as {
      model: string;
      systemPrompt: string;
      userMessage: string;
      result: string;
    };
    return (
      <NodeShell data={data}>
        <div className="grid gap-3">
          <Field label="Model">
            <Input
              value={config.model}
              onChange={(event) => updateNodeConfig(id, { model: event.target.value })}
              placeholder="gemini-2.0-flash"
            />
          </Field>
          <Field label="System Prompt" disabled={systemConnected}>
            <Textarea
              value={config.systemPrompt}
              onChange={(event) => updateNodeConfig(id, { systemPrompt: event.target.value })}
              disabled={systemConnected}
            />
          </Field>
          <Field label="User Message" disabled={userConnected}>
            <Textarea
              value={config.userMessage}
              onChange={(event) => updateNodeConfig(id, { userMessage: event.target.value })}
              disabled={userConnected}
            />
          </Field>
          <Field label="Image Inputs" disabled={imageConnected} hint="Connected image nodes fan in here automatically.">
            <Input value={imageConnected ? "Inherited from upstream image nodes" : "Attach via connection"} disabled />
          </Field>
          <Field label="Inline Result">
            <Textarea value={config.result} disabled placeholder="LLM responses render inline after execution." />
          </Field>
        </div>
      </NodeShell>
    );
  }

  if (data.nodeType === "cropImage") {
    const config = data.config as {
      imageUrl: string;
      xPercent: number;
      yPercent: number;
      widthPercent: number;
      heightPercent: number;
    };
    return (
      <NodeShell data={data}>
        <div className="grid gap-3">
          <Field label="Image URL" disabled={cropImageConnected}>
            <Input
              value={config.imageUrl}
              onChange={(event) => updateNodeConfig(id, { imageUrl: event.target.value })}
              disabled={cropImageConnected}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="X %" disabled={xConnected}>
              <Input
                type="number"
                value={config.xPercent}
                onChange={(event) => updateNodeConfig(id, { xPercent: Number(event.target.value) })}
                disabled={xConnected}
              />
            </Field>
            <Field label="Y %" disabled={yConnected}>
              <Input
                type="number"
                value={config.yPercent}
                onChange={(event) => updateNodeConfig(id, { yPercent: Number(event.target.value) })}
                disabled={yConnected}
              />
            </Field>
            <Field label="Width %" disabled={widthConnected}>
              <Input
                type="number"
                value={config.widthPercent}
                onChange={(event) => updateNodeConfig(id, { widthPercent: Number(event.target.value) })}
                disabled={widthConnected}
              />
            </Field>
            <Field label="Height %" disabled={heightConnected}>
              <Input
                type="number"
                value={config.heightPercent}
                onChange={(event) => updateNodeConfig(id, { heightPercent: Number(event.target.value) })}
                disabled={heightConnected}
              />
            </Field>
          </div>
        </div>
      </NodeShell>
    );
  }

  const config = data.config as { videoUrl: string; timestamp: string };

  return (
    <NodeShell data={data}>
      <div className="grid gap-3">
        <Field label="Video URL" disabled={videoConnected}>
          <Input
            value={config.videoUrl}
            onChange={(event) => updateNodeConfig(id, { videoUrl: event.target.value })}
            disabled={videoConnected}
          />
        </Field>
        <Field label="Timestamp" disabled={timestampConnected} hint='Seconds or percentage like "50%".'>
          <Input
            value={config.timestamp}
            onChange={(event) => updateNodeConfig(id, { timestamp: event.target.value })}
            disabled={timestampConnected}
          />
        </Field>
      </div>
    </NodeShell>
  );
}

export const workflowNodeTypes = {
  text: WorkflowNodeComponent,
  uploadImage: WorkflowNodeComponent,
  uploadVideo: WorkflowNodeComponent,
  llm: WorkflowNodeComponent,
  cropImage: WorkflowNodeComponent,
  extractFrame: WorkflowNodeComponent,
};
