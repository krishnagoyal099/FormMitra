// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

/**
 * Single source of truth for all supported locales and the default locale.
 * Used by both middleware (for routing) and navigation helpers.
 */
export const routing = defineRouting({
  // All supported locales in the application
  locales: ["en", "hi"],

  // Default locale — English URLs will have no prefix (e.g. /dashboard)
  // Hindi URLs will be prefixed (e.g. /hi/dashboard)
  defaultLocale: "en",

  // Only add locale prefix for non-default locales
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
