interface Props {
  href?: string | null;
  className?: string;
}

export default function SmashDownloadButton({ href, className = "" }: Props) {
  const url = href?.trim();
  if (!url) return null;

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
      Download on Smash
    </a>
  );
}
