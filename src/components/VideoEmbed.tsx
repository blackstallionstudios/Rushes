interface Props {
  url: string;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    // color= matches the gold design token (--color-gold: #c9a84c)
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?color=c9a84c&title=0&byline=0&portrait=0`;
  }

  return null;
}

export default function VideoEmbed({ url }: Props) {
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="aspect-video bg-bg-elevated flex items-center justify-center text-ink-muted text-sm">
        Unsupported video URL
      </div>
    );
  }

  return (
    <div className="aspect-video bg-bg-elevated">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        title="Project Video"
      />
    </div>
  );
}
