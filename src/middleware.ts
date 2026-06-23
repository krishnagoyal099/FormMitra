// src/middleware.ts
// IMPORTANT: Middleware runs in the Edge Runtime — no Node.js APIs, no Prisma.
//
// This middleware composes two concerns:
// 1. next-intl locale routing — detects user language, prefixes URLs (e.g. /hi/dashboard)
// 2. Auth guard — redirects unauthenticated users to /login for protected routes
//
// next-auth@5.0.0-beta uses "authjs." prefix for cookies.
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

// next-auth v5 beta cookie names
const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

// Fallback: next-auth v4 style
const SESSION_COOKIE_LEGACY = "next-auth.session-token";

// Protected route prefixes (without locale prefix — we strip it below)
const PROTECTED_PATHS = ["/dashboard", "/documents", "/opportunities", "/settings", "/onboarding"];

/** Strips a locale prefix from a pathname if present (e.g. /hi/dashboard → /dashboard) */
function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || "/";
    }
  }
  return pathname;
}

const handleI18nRouting = createMiddleware(routing);

export function middleware(req: NextRequest) {
  // Step 1: Run the next-intl middleware to handle locale detection & URL rewriting
  const i18nResponse = handleI18nRouting(req);

  // Step 2: Determine the effective pathname (locale-stripped) for auth checking
  const strippedPath = stripLocale(req.nextUrl.pathname);

  const isProtected = PROTECTED_PATHS.some(
    (path) => strippedPath === path || strippedPath.startsWith(`${path}/`)
  );

  if (isProtected) {
    const hasSession =
      req.cookies.has(SESSION_COOKIE) || req.cookies.has(SESSION_COOKIE_LEGACY);

    if (!hasSession) {
      // Redirect to login, preserving the original path as callback
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Return the i18n-modified response (with locale headers/rewrites applied)
  return i18nResponse;
}

export const config = {
  // Match all pathnames except Next.js internals, API routes, and static files
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};