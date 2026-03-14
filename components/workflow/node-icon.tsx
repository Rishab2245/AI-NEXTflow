import {
  Film,
  ImageIcon,
  type LucideIcon,
  ScanSearch,
  Type,
  WandSparkles,
} from "lucide-react";

import type { NodeKind } from "@/lib/workflow/types";

const iconMap: Record<NodeKind, LucideIcon> = {
  text: Type,
  uploadImage: ImageIcon,
  uploadVideo: Film,
  llm: WandSparkles,
  cropImage: ScanSearch,
  extractFrame: Film,
};

export function WorkflowNodeIcon({
  kind,
  className,
}: {
  kind: NodeKind;
  className?: string;
}) {
  const Icon = iconMap[kind];
  return <Icon className={className} />;
}
