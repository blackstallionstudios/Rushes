import { isDownloadExpired } from "../lib/downloadExpiry";
import { normalizeExternalHref } from "../lib/utils";

interface Props {
  href?: string | null;
  /** Unix ms; after this instant the link is treated as expired. */
  expiresAt?: number | null;
  /** When true and the link is expired, show a muted label instead of hiding. */
  showExpiredHint?: boolean;
  className?: string;
}

export default function DownloadButton({
  href,
  expiresAt,
  showExpiredHint = false,
  className = "",
}: Props) {
  const url = normalizeExternalHref(href ?? "");
  if (!url) return null;

  const expired = isDownloadExpired(expiresAt ?? null);
  if (expired && !showExpiredHint) return null;

  if (expired && showExpiredHint) {
    return (
      <span
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-ink-faint bg-bg-elevated text-ink-muted text-sm font-medium tracking-wide shadow-neu-flat cursor-default ${className}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 opacity-70"
          aria-hidden
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
        Download expired
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gold/60 bg-bg-elevated text-gold text-sm font-medium tracking-wide hover:border-gold hover:bg-gold-muted/25 hover:shadow-gold-glow transition-all shadow-neu-flat ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 opacity-90"
        aria-hidden
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
      </svg>
      Download File
    </a>
  );
}
