// src/app/[locale]/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { ClerkProvider } from "@clerk/nextjs";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  keywords: ["scholarships", "applications", "AI agent", "government forms", "documents", "India"],
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale — show 404 if an unknown locale is accessed
  if (!routing.locales.includes(locale as "en" | "hi")) {
    notFound();
  }

  // Load the message dictionary for the current locale (server-side)
  const messages = await getMessages();

  return (
    <ClerkProvider
      signInFallbackRedirectUrl={`/${locale}/dashboard`}
      signUpFallbackRedirectUrl={`/${locale}/dashboard`}
      signInUrl={`/${locale}/login`}
      signUpUrl={`/${locale}/register`}
    >
      <html lang={locale} suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
          {/* Provide translations to all Client Components in this subtree */}
          <NextIntlClientProvider messages={messages}>
            <TooltipProvider delayDuration={150}>
              {children}
              <Toaster />
            </TooltipProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
