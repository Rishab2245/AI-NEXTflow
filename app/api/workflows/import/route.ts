import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/server/auth";
import { importWorkflow } from "@/lib/server/storage";
import { workflowImportSchema } from "@/lib/workflow/types";

export async function POST(request: Request) {
  const userId = await requireUserId();
  const parsed = workflowImportSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid import payload." }, { status: 400 });
  }

  const workflow = await importWorkflow(parsed.data, userId);
  return NextResponse.json(workflow);
}
