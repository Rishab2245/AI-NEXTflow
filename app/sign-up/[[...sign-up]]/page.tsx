import { redirect } from "next/navigation";

import { AuthCard } from "@/components/site/auth-card";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getAuthState } from "@/lib/server/auth";

export default async function SignUpPage() {
  const authState = await getAuthState();

  if (authState.isSignedIn) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f7f1e7] text-[#11110f]">
      <SiteHeader signedIn={authState.isSignedIn} />
      <main className="px-6 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[40px] border border-black/8 bg-[linear-gradient(180deg,#f0dcc5,#ead0b0)] p-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#7f6e5a]">Create account</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.02]">Start building your own AI workflow product.</h1>
            <p className="mt-5 text-sm leading-8 text-[#5e564c]">
              Sign up to enter the dashboard, create workflows, and turn the editor into a hosted tool your team can use daily.
            </p>
          </section>
          <AuthCard mode="sign-up" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
