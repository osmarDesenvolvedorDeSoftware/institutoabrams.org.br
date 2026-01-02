export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL || "";
  if (mediaBase) {
    return `${mediaBase}${path}`;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  try {
    const baseUrl = new URL(apiBase);
    return `${baseUrl.origin}${path}`;
  } catch (error) {
    return path;
  }
}

export const getYoutubeEmbedUrl = (url?: string | null): string | null => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const start = getYoutubeStartSeconds(parsed);
    const startParam = start ? `?start=${start}` : "";
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}${startParam}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}${startParam}`;
      const paths = parsed.pathname.split("/");
      const embedIndex = paths.indexOf("embed");
      if (embedIndex !== -1 && paths[embedIndex + 1]) {
        return `https://www.youtube.com/embed/${paths[embedIndex + 1]}${startParam}`;
      }
    }
  } catch (e) {
    return null;
  }
  return null;
};

const getYoutubeStartSeconds = (parsed: URL): number | null => {
  const raw = parsed.searchParams.get("t") || parsed.searchParams.get("start");
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  if (/^\d+$/.test(normalized)) {
    const seconds = Number(normalized);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
  }
  const match = normalized.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
  if (!match) return null;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  const total = hours * 3600 + minutes * 60 + seconds;
  return total > 0 ? total : null;
};

export const normalizeYoutubeEmbeds = (html: string): string => {
  if (!html) return html;
  if (!html.includes("youtube") && !html.includes("youtu.be")) return html;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const iframes = Array.from(doc.querySelectorAll("iframe"));
    let updated = false;
    iframes.forEach((iframe) => {
      const src = iframe.getAttribute("src");
      if (!src) return;
      if (!src.includes("youtube") && !src.includes("youtu.be")) return;
      const embedUrl = getYoutubeEmbedUrl(src);
      if (embedUrl && embedUrl !== src) {
        iframe.setAttribute("src", embedUrl);
        updated = true;
      }
    });
    return updated ? doc.body.innerHTML : html;
  } catch (error) {
    return html;
  }
};
