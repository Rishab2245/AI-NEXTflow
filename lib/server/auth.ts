import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export function isClerkConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}

export async function getCurrentUserId() {
  if (!isClerkConfigured()) return null;
  const session = await auth();
  return session.userId;
}

export async function getAuthState() {
  if (!isClerkConfigured()) {
    return {
      isConfigured: false,
      isSignedIn: false,
      userId: null as string | null,
    };
  }

  const session = await auth();

  return {
    isConfigured: true,
    isSignedIn: Boolean(session.userId),
    userId: session.userId,
  };
}

export async function requireUserId() {
  if (!isClerkConfigured()) {
    redirect("/sign-in?reason=clerk-not-configured");
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/sign-in");
  }

  return userId;
}
