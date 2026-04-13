/** Seven days in ms (used as default download link lifetime). */
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** `YYYY-MM-DD` for `<input type="date" />` in local time. */
export function msToDateInputValue(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Expiry instant: end of the chosen calendar day (local timezone). */
export function dateInputValueToEndOfDayMs(value: string): number {
  const parts = value.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!y || !m || !d) {
    return Date.now() + SEVEN_DAYS_MS;
  }
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}

export function suggestedDefaultExpiryDateInputValue(): string {
  return msToDateInputValue(Date.now() + SEVEN_DAYS_MS);
}

export function isDownloadExpired(expiresAt: number | undefined | null): boolean {
  if (expiresAt == null) return false;
  return Date.now() > expiresAt;
}

export function formatExpiryDate(expiresAt: number): string {
  return new Date(expiresAt).toLocaleDateString(undefined, { dateStyle: "medium" });
}

/** Single line for clients and admins whenever a download link is shown. */
export function formatDownloadExpiryNotice(
  expiresAt: number | undefined | null,
): string {
  if (expiresAt == null) {
    return "No expiry date on file.";
  }
  if (isDownloadExpired(expiresAt)) {
    return `Expired on ${formatExpiryDate(expiresAt)}.`;
  }
  return `Expires ${formatExpiryDate(expiresAt)}.`;
}
