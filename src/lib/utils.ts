import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * External links without a scheme (e.g. "example.com/path") are resolved as
 * paths relative to the current page, which reloads the SPA instead of opening
 * the transfer site. This prepends https for bare hostnames and fixes // URLs.
 */
export function normalizeExternalHref(raw: string): string {
  const u = raw.trim();
  if (!u) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(u)) return u;
  return `https://${u}`;
}
