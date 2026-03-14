import Link from "next/link";
import { Mail, MessageSquareMore, PhoneCall } from "lucide-react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getAuthState } from "@/lib/server/auth";

export default async function ContactPage() {
  const authState = await getAuthState();

  return (
    <div className="min-h-screen bg-[#f7f1e7] text-[#11110f]">
      <SiteHeader signedIn={authState.isSignedIn} currentPath="/contact" />
      <main className="px-6 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[40px] border border-black/8 bg-[#17332e] p-8 text-[#f6f0e5] shadow-[0_24px_60px_-40px_rgba(0,0,0,0.25)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#9fbaae]">Contact</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.02]">Talk to us about deploying NEXTflow for your team.</h1>
            <p className="mt-5 text-sm leading-8 text-[#dce6df]">
              Use this page as the public contact surface for the product. It works well for sales, partnerships, support, or internal platform onboarding.
            </p>
            <div className="mt-8 grid gap-4">
              {[
                { icon: Mail, label: "Email", value: "hello@nextflow.app" },
                { icon: MessageSquareMore, label: "Support", value: "Priority onboarding and implementation guidance" },
                { icon: PhoneCall, label: "Live demo", value: "Book a walkthrough for your team" },
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <item.icon className="h-5 w-5 text-[#cde2d7]" />
                  <p className="mt-3 text-sm font-semibold">{item.label}</p>
                  <p className="mt-2 text-sm leading-7 text-[#dce6df]">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[40px] border border-black/8 bg-white/75 p-8 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.2)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#7f6e5a]">Send a message</p>
            <div className="mt-6 grid gap-4">
              {["Full name", "Work email", "Company", "How can we help?"].map((label, index) => (
                <label key={label} className="grid gap-2 text-sm font-medium text-[#201d19]">
                  {label}
                  {index === 3 ? (
                    <textarea
                      className="min-h-40 rounded-[24px] border border-black/10 bg-[#fcfaf6] px-4 py-3 text-sm outline-none transition focus:border-[#0d4a46]"
                      placeholder="Tell us about your workflows, deployment needs, or onboarding questions."
                    />
                  ) : (
                    <input
                      className="h-12 rounded-[24px] border border-black/10 bg-[#fcfaf6] px-4 text-sm outline-none transition focus:border-[#0d4a46]"
                      placeholder={label}
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="mailto:hello@nextflow.app"
                className="rounded-full bg-[#11110f] px-5 py-3 text-sm font-medium text-[#f6f0e5] transition hover:bg-[#0d4a46]"
              >
                Request a demo
              </a>
              <Link
                href="/sign-up"
                className="rounded-full border border-[#c9bcab] px-5 py-3 text-sm font-medium text-[#201d19] transition hover:border-[#11110f]"
              >
                Create account
              </Link>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
