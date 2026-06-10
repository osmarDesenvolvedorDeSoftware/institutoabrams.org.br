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

export type SupportedVideoPlatform = "youtube" | "vimeo" | "instagram" | "tiktok" | "facebook";

export type VideoEmbedConfig = {
  platform: SupportedVideoPlatform;
  embedKind: "iframe" | "instagram" | "tiktok" | "facebook";
  originalUrl: string;
  canonicalUrl: string;
  embedUrl?: string;
  title: string;
  authorPath?: string;
  videoId?: string;
};

export const getVideoEmbedConfig = (url?: string | null): VideoEmbedConfig | null => {
  if (!url) return null;

  try {
    const parsed = new URL(normalizeExternalUrl(url));
    const hostname = parsed.hostname.toLowerCase();

    return (
      getYoutubeVideoEmbed(parsed, hostname) ||
      getVimeoVideoEmbed(parsed, hostname) ||
      getInstagramVideoEmbed(parsed, hostname) ||
      getTikTokVideoEmbed(parsed, hostname) ||
      getFacebookVideoEmbed(parsed, hostname)
    );
  } catch (error) {
    return null;
  }
};

export const getYoutubeEmbedUrl = (url?: string | null): string | null => {
  const config = getVideoEmbedConfig(url);
  return config?.platform === "youtube" ? config.embedUrl || null : null;
};

export const getRichTextVideoEmbedHtml = (url?: string | null): string | null => {
  const config = getVideoEmbedConfig(url);
  if (!config) return null;

  if (config.embedKind === "iframe" && config.embedUrl) {
    return `<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="${escapeHtmlAttribute(config.embedUrl)}"></iframe>`;
  }

  if (config.embedKind === "instagram") {
    return `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${escapeHtmlAttribute(
      `${config.canonicalUrl}?utm_source=ig_embed&utm_campaign=loading`,
    )}" data-instgrm-version="14" style="background:#fff;border:0;border-radius:3px;box-shadow:0 0 1px 0 rgba(0,0,0,.5),0 1px 10px 0 rgba(0,0,0,.15);margin:1px;max-width:658px;min-width:326px;padding:0;width:calc(100% - 2px)"></blockquote>`;
  }

  if (config.embedKind === "tiktok") {
    const authorLabel = escapeHtml(config.authorPath?.split("/").filter(Boolean).pop() || "TikTok");
    const authorUrl = escapeHtmlAttribute(config.authorPath || config.canonicalUrl);
    return `<blockquote class="tiktok-embed" cite="${escapeHtmlAttribute(config.canonicalUrl)}"${
      config.videoId ? ` data-video-id="${escapeHtmlAttribute(config.videoId)}"` : ""
    } style="max-width:605px;min-width:325px"><section><a target="_blank" title="${authorLabel}" href="${authorUrl}">${authorLabel}</a></section></blockquote>`;
  }

  if (config.embedKind === "facebook") {
    return `<div class="fb-video" data-href="${escapeHtmlAttribute(config.canonicalUrl)}" data-allowfullscreen="true" data-show-text="false"></div>`;
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

const getYoutubeVideoEmbed = (parsed: URL, hostname: string): VideoEmbedConfig | null => {
  if (!hostname.includes("youtu.be") && !hostname.includes("youtube.com") && !hostname.includes("youtube-nocookie.com")) {
    return null;
  }

  const start = getYoutubeStartSeconds(parsed);
  const params = new URLSearchParams();
  if (start) params.set("start", String(start));

  let videoId = "";
  if (hostname.includes("youtu.be")) {
    videoId = parsed.pathname.split("/").filter(Boolean)[0] || "";
  } else {
    const paths = parsed.pathname.split("/").filter(Boolean);
    if (paths[0] === "watch") {
      videoId = parsed.searchParams.get("v") || "";
    } else if (["embed", "shorts", "live"].includes(paths[0])) {
      videoId = paths[1] || "";
    } else {
      videoId = parsed.searchParams.get("v") || "";
    }
  }

  if (!videoId) return null;

  const query = params.toString();
  return {
    platform: "youtube",
    embedKind: "iframe",
    originalUrl: parsed.toString(),
    canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}${query ? `?${query}` : ""}`,
    title: "Vídeo do YouTube",
    videoId,
  };
};

const getVimeoVideoEmbed = (parsed: URL, hostname: string): VideoEmbedConfig | null => {
  if (!hostname.includes("vimeo.com")) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  const videoId = [...segments].reverse().find((segment) => /^\d+$/.test(segment));
  if (!videoId) return null;

  return {
    platform: "vimeo",
    embedKind: "iframe",
    originalUrl: parsed.toString(),
    canonicalUrl: `https://vimeo.com/${videoId}`,
    embedUrl: `https://player.vimeo.com/video/${videoId}`,
    title: "Vídeo do Vimeo",
    videoId,
  };
};

const getInstagramVideoEmbed = (parsed: URL, hostname: string): VideoEmbedConfig | null => {
  if (!hostname.includes("instagram.com") && !hostname.includes("instagr.am")) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (!segments[0] || !segments[1]) return null;
  if (!["p", "reel", "tv"].includes(segments[0])) return null;

  const canonicalUrl = `https://www.instagram.com/${segments[0]}/${segments[1]}/`;
  return {
    platform: "instagram",
    embedKind: "instagram",
    originalUrl: parsed.toString(),
    canonicalUrl,
    title: "Post do Instagram",
    videoId: segments[1],
  };
};

const getTikTokVideoEmbed = (parsed: URL, hostname: string): VideoEmbedConfig | null => {
  if (!hostname.includes("tiktok.com")) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  const videoIndex = segments.indexOf("video");
  if (videoIndex === -1 || !segments[videoIndex + 1]) return null;

  const authorPath = segments[0]?.startsWith("@") ? `https://www.tiktok.com/${segments[0]}` : undefined;
  const videoId = segments[videoIndex + 1];

  return {
    platform: "tiktok",
    embedKind: "tiktok",
    originalUrl: parsed.toString(),
    canonicalUrl: authorPath ? `${authorPath}/video/${videoId}` : `https://www.tiktok.com/video/${videoId}`,
    title: "Vídeo do TikTok",
    authorPath,
    videoId,
  };
};

const getFacebookVideoEmbed = (parsed: URL, hostname: string): VideoEmbedConfig | null => {
  if (!hostname.includes("facebook.com") && !hostname.includes("fb.watch")) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  const looksLikeVideoPath = hostname.includes("fb.watch") || segments.includes("videos") || parsed.searchParams.has("v");
  if (!looksLikeVideoPath) return null;

  return {
    platform: "facebook",
    embedKind: "facebook",
    originalUrl: parsed.toString(),
    canonicalUrl: parsed.toString(),
    title: "Vídeo do Facebook",
    videoId: parsed.searchParams.get("v") || segments[segments.indexOf("videos") + 1] || undefined,
  };
};

const normalizeExternalUrl = (url: string) => {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/\//, "")}`;
};

const escapeHtmlAttribute = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
