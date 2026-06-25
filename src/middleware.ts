import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  '/(.*)/dashboard(.*)',
  '/(.*)/documents(.*)',
  '/(.*)/opportunities(.*)',
  '/(.*)/settings(.*)',
  '/(.*)/onboarding(.*)',
  '/dashboard(.*)',
  '/documents(.*)',
  '/opportunities(.*)',
  '/settings(.*)',
  '/onboarding(.*)'
])

// Routes that handle their own auth (Bearer token or webhook signature)
const isPublicApiRoute = createRouteMatcher([
  '/api/webhooks/(.*)',      // Clerk webhooks — verified by svix signature
  '/api/extension/profile', // Bearer token auth, not Clerk sessions
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicApiRoute(req) && isProtectedRoute(req)) {
    await auth.protect()
  }

  // Bypass next-intl if this is a Clerk handshake or Clerk API route
  if (
    req.nextUrl.searchParams.has('__clerk_handshake') ||
    req.nextUrl.pathname.startsWith('/__clerk')
  ) {
    return;
  }

  return handleI18nRouting(req)
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}