import { DEFAULT_WORKFLOW_ID } from "@/lib/constants";
import type { WorkflowGraph, WorkflowRecord } from "@/lib/workflow/types";

export const sampleWorkflowGraph: WorkflowGraph = {
  metadata: {
    name: "Product Marketing Kit Generator",
    description: "Parallel image and video branches that converge on a multimodal Gemini prompt.",
  },
  viewport: { x: 70, y: 40, zoom: 0.82 },
  nodes: [
    {
      id: "image-upload",
      type: "uploadImage",
      position: { x: 120, y: 110 },
      data: {
        nodeType: "uploadImage",
        title: "Upload Image",
        subtitle: "Product photo",
        config: {
          imageUrl:
            "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=900&q=80",
          fileName: "product-photo.jpg",
        },
        runState: { status: "idle" },
      },
    },
    {
      id: "text-system",
      type: "text",
      position: { x: 120, y: 380 },
      data: {
        nodeType: "text",
        title: "Text Node",
        subtitle: "System prompt",
        config: {
          content:
            "You are a premium marketing copywriter. Generate polished campaign-ready copy for a product launch.",
        },
        runState: { status: "idle" },
      },
    },
    {
      id: "text-product",
      type: "text",
      position: { x: 120, y: 610 },
      data: {
        nodeType: "text",
        title: "Text Node",
        subtitle: "Product details",
        config: {
          content:
            "Product: Wireless Bluetooth Headphones. Features: noise cancellation, 30-hour battery life, foldable design, matte black finish.",
        },
        runState: { status: "idle" },
      },
    },
    {
      id: "crop-image",
      type: "cropImage",
      position: { x: 470, y: 140 },
      data: {
        nodeType: "cropImage",
        title: "Crop Image",
        subtitle: "Hero framing",
        config: {
          imageUrl: "",
          xPercent: 10,
          yPercent: 10,
          widthPercent: 80,
          heightPercent: 80,
        },
        runState: { status: "idle" },
      },
    },
    {
      id: "llm-branch-a",
      type: "llm",
      position: { x: 820, y: 300 },
      data: {
        nodeType: "llm",
        title: "Run Any LLM",
        subtitle: "Product description",
        config: {
          model: "gemini-2.0-flash",
          systemPrompt: "",
          userMessage: "",
          result: "",
        },
        runState: { status: "idle" },
      },
    },
    {
      id: "video-upload",
      type: "uploadVideo",
      position: { x: 170, y: 930 },
      data: {
        nodeType: "uploadVideo",
        title: "Upload Video",
        subtitle: "Demo clip",
        config: {
          videoUrl:
            "https://www.w3schools.com/html/mov_bbb.mp4",
          fileName: "demo-video.mp4",
        },
        runState: { status: "idle" },
      },
    },
    {
      id: "extract-frame",
      type: "extractFrame",
      position: { x: 510, y: 900 },
      data: {
        nodeType: "extractFrame",
        title: "Extract Frame",
        subtitle: "Midpoint still",
        config: {
          videoUrl: "",
          timestamp: "50%",
        },
        runState: { status: "idle" },
      },
    },
    {
      id: "llm-converge",
      type: "llm",
      position: { x: 1140, y: 500 },
      data: {
        nodeType: "llm",
        title: "Run Any LLM",
        subtitle: "Marketing summary",
        config: {
          model: "gemini-2.0-flash",
          systemPrompt:
            "You are a social media manager. Create a tweet-length launch post from the provided product copy and the attached visuals.",
          userMessage: "",
          result: "",
        },
        runState: { status: "idle" },
      },
    },
  ],
  edges: [
    { id: "e-image-crop", source: "image-upload", target: "crop-image", sourceHandle: "output", targetHandle: "image_url", animated: true },
    { id: "e-system-a", source: "text-system", target: "llm-branch-a", sourceHandle: "output", targetHandle: "system_prompt", animated: true },
    { id: "e-product-a", source: "text-product", target: "llm-branch-a", sourceHandle: "output", targetHandle: "user_message", animated: true },
    { id: "e-crop-a", source: "crop-image", target: "llm-branch-a", sourceHandle: "output", targetHandle: "images", animated: true },
    { id: "e-video-frame", source: "video-upload", target: "extract-frame", sourceHandle: "output", targetHandle: "video_url", animated: true },
    { id: "e-system-final", source: "text-system", target: "llm-converge", sourceHandle: "output", targetHandle: "system_prompt", animated: true },
    { id: "e-a-final", source: "llm-branch-a", target: "llm-converge", sourceHandle: "output", targetHandle: "user_message", animated: true },
    { id: "e-crop-final", source: "crop-image", target: "llm-converge", sourceHandle: "output", targetHandle: "images", animated: true },
    { id: "e-frame-final", source: "extract-frame", target: "llm-converge", sourceHandle: "output", targetHandle: "images", animated: true },
  ],
};

export function createSampleWorkflowRecord(userId: string): WorkflowRecord {
  const now = new Date().toISOString();

  return {
    id: DEFAULT_WORKFLOW_ID,
    userId,
    name: sampleWorkflowGraph.metadata.name,
    graph: sampleWorkflowGraph,
    createdAt: now,
    updatedAt: now,
  };
}
