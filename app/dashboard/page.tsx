import { SiteHeader } from "@/components/site/site-header";
import { DashboardShell } from "@/components/site/dashboard-shell";
import { requireUserId } from "@/lib/server/auth";
import { listWorkflows } from "@/lib/server/storage";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const workflows = await listWorkflows(userId);

  return (
    <div className="min-h-screen bg-[#f7f1e7]">
      <SiteHeader signedIn currentPath="/" />
      <DashboardShell workflows={workflows} />
    </div>
  );
}
