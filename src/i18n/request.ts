// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * Called once per request on the server. Loads the correct message dictionary
 * based on the resolved locale and provides it to all Server Components.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // Validate the incoming locale; fall back to defaultLocale if invalid
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "hi")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
