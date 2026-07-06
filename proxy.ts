import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/config";

// Next.js 16 renamed the `middleware.ts` convention to `proxy.ts` — same
// file, same behavior, new name. See node_modules/next/dist/docs/01-app/
// 03-api-reference/03-file-conventions/proxy.md if this ever needs revisiting.

// /api/webhooks is server-to-server (e.g. Stripe) — it verifies its own
// signature and carries no Clerk session, so it must never hit auth.protect().
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

// Until real Clerk keys are added to .env.local, skip Clerk entirely rather
// than letting the SDK throw on placeholder keys — the whole app should
// still build and the landing page should still load.
const proxyHandler = isClerkConfigured()
  ? clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        await auth.protect();
      }
    })
  : function noopProxy() {
      return NextResponse.next();
    };

export default proxyHandler;

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)", "/__clerk/:path*"],
};
