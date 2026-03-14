import type { NodeHandleDefinition, NodeKind, WorkflowNode, WorkflowNodeData } from "@/lib/workflow/types";

export const nodeCatalog: Array<{
  kind: NodeKind;
  title: string;
  subtitle: string;
  description: string;
}> = [
  {
    kind: "text",
    title: "Text Node",
    subtitle: "Source text",
    description: "Write prompts, product details, or reusable system instructions.",
  },
  {
    kind: "uploadImage",
    title: "Upload Image",
    subtitle: "Media source",
    description: "Upload and preview JPG, PNG, WEBP, or GIF assets.",
  },
  {
    kind: "uploadVideo",
    title: "Upload Video",
    subtitle: "Media source",
    description: "Upload MP4, MOV, WEBM, or M4V assets.",
  },
  {
    kind: "llm",
    title: "Run Any LLM",
    subtitle: "Gemini via Trigger.dev",
    description: "Combine text and visual inputs into multimodal prompt execution.",
  },
  {
    kind: "cropImage",
    title: "Crop Image",
    subtitle: "FFmpeg crop",
    description: "Crop an uploaded image with percentage-based controls.",
  },
  {
    kind: "extractFrame",
    title: "Extract Frame",
    subtitle: "FFmpeg frame capture",
    description: "Grab a still image from a chosen point in a video.",
  },
];

export const nodeHandles: Record<NodeKind, NodeHandleDefinition[]> = {
  text: [{ id: "output", label: "Output", kind: "output", valueKind: "text" }],
  uploadImage: [{ id: "output", label: "Image URL", kind: "output", valueKind: "image" }],
  uploadVideo: [{ id: "output", label: "Video URL", kind: "output", valueKind: "video" }],
  llm: [
    { id: "system_prompt", label: "System", kind: "input", valueKind: "text" },
    { id: "user_message", label: "User", kind: "input", valueKind: "text", required: true },
    { id: "images", label: "Images", kind: "input", valueKind: "image", multiple: true },
    { id: "output", label: "Output", kind: "output", valueKind: "text" },
  ],
  cropImage: [
    { id: "image_url", label: "Image", kind: "input", valueKind: "image", required: true },
    { id: "x_percent", label: "X %", kind: "input", valueKind: "number" },
    { id: "y_percent", label: "Y %", kind: "input", valueKind: "number" },
    { id: "width_percent", label: "Width %", kind: "input", valueKind: "number" },
    { id: "height_percent", label: "Height %", kind: "input", valueKind: "number" },
    { id: "output", label: "Output", kind: "output", valueKind: "image" },
  ],
  extractFrame: [
    { id: "video_url", label: "Video", kind: "input", valueKind: "video", required: true },
    { id: "timestamp", label: "Timestamp", kind: "input", valueKind: "text" },
    { id: "output", label: "Output", kind: "output", valueKind: "image" },
  ],
};

export function createNodeData(kind: NodeKind): WorkflowNodeData {
  switch (kind) {
    case "text":
      return {
        nodeType: "text",
        title: "Text Node",
        subtitle: "Prompt input",
        config: { content: "" },
        runState: { status: "idle" },
      };
    case "uploadImage":
      return {
        nodeType: "uploadImage",
        title: "Upload Image",
        subtitle: "Transloadit source",
        config: { imageUrl: "" },
        runState: { status: "idle" },
      };
    case "uploadVideo":
      return {
        nodeType: "uploadVideo",
        title: "Upload Video",
        subtitle: "Transloadit source",
        config: { videoUrl: "" },
        runState: { status: "idle" },
      };
    case "llm":
      return {
        nodeType: "llm",
        title: "Run Any LLM",
        subtitle: "Gemini",
        config: {
          model: "gemini-2.0-flash",
          systemPrompt: "",
          userMessage: "",
          result: "",
        },
        runState: { status: "idle" },
      };
    case "cropImage":
      return {
        nodeType: "cropImage",
        title: "Crop Image",
        subtitle: "FFmpeg",
        config: {
          imageUrl: "",
          xPercent: 0,
          yPercent: 0,
          widthPercent: 100,
          heightPercent: 100,
        },
        runState: { status: "idle" },
      };
    case "extractFrame":
      return {
        nodeType: "extractFrame",
        title: "Extract Frame",
        subtitle: "FFmpeg",
        config: { videoUrl: "", timestamp: "0" },
        runState: { status: "idle" },
      };
  }
}

export function createNode(kind: NodeKind, id: string, x: number, y: number): WorkflowNode {
  return {
    id,
    type: kind,
    position: { x, y },
    data: createNodeData(kind),
  };
}
