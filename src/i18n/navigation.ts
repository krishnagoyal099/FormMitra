// src/i18n/navigation.ts
// Locale-aware navigation helpers generated from our routing config.
// Use these instead of next/navigation's useRouter/usePathname/Link
// so that locale prefixes are handled automatically.
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
