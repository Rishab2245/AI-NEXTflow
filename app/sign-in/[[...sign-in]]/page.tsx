import { redirect } from "next/navigation";

import { AuthCard } from "@/components/site/auth-card";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getAuthState } from "@/lib/server/auth";

export default async function SignInPage() {
  const authState = await getAuthState();

  if (authState.isSignedIn) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f7f1e7] text-[#11110f]">
      <SiteHeader signedIn={authState.isSignedIn} />
      <main className="px-6 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[40px] border border-black/8 bg-[linear-gradient(180deg,#17332e,#0f2521)] p-8 text-[#f6f0e5]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#9fbaae]">Log in</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.02]">Welcome back to the control room.</h1>
            <p className="mt-5 text-sm leading-8 text-[#dce6df]">
              Sign in to access your workflows, run history, and the dashboard hub that sits in front of the builder.
            </p>
          </section>
          <AuthCard mode="sign-in" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
