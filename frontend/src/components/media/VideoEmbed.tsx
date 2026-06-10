import { useEffect, useMemo, useRef } from "react";

import { getVideoEmbedConfig } from "../../utils/media";

declare global {
  interface Window {
    FB?: {
      XFBML?: {
        parse: (node?: Element) => void;
      };
    };
    fbAsyncInit?: () => void;
    instgrm?: {
      Embeds?: {
        process: () => void;
      };
    };
  }
}

type Props = {
  url?: string | null;
  title: string;
};

let instagramScriptPromise: Promise<void> | null = null;
let facebookScriptPromise: Promise<void> | null = null;

export const VideoEmbed = ({ url, title }: Props) => {
  const config = useMemo(() => getVideoEmbedConfig(url), [url]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !config) return;

    container.innerHTML = "";

    if (config.embedKind === "instagram") {
      renderInstagramEmbed(container, config.canonicalUrl);
      processInstagramEmbeds(container).catch(() => undefined);
      return;
    }

    if (config.embedKind === "tiktok") {
      renderTikTokEmbed(container, config.canonicalUrl, config.videoId, config.authorPath);
      processTikTokEmbeds().catch(() => undefined);
      return;
    }

    if (config.embedKind === "facebook") {
      renderFacebookEmbed(container, config.canonicalUrl);
      processFacebookEmbeds(container).catch(() => undefined);
    }
  }, [config]);

  if (!config) return null;

  if (config.embedKind === "iframe" && config.embedUrl) {
    return (
      <div style={{ marginTop: "0.5rem" }}>
        <div
          style={{
            position: "relative",
            paddingBottom: "56.25%",
            height: 0,
            overflow: "hidden",
            borderRadius: 14,
          }}
        >
          <iframe
            src={config.embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
          />
        </div>
      </div>
    );
  }

  return <div ref={containerRef} style={{ marginTop: "0.5rem", display: "grid", justifyItems: "center" }} />;
};

export const processSocialEmbedsInContainer = (container: HTMLElement) => {
  const tasks: Promise<void>[] = [];

  if (container.querySelector(".instagram-media")) {
    tasks.push(processInstagramEmbeds(container));
  }

  if (container.querySelector(".fb-video")) {
    tasks.push(processFacebookEmbeds(container));
  }

  if (container.querySelector(".tiktok-embed")) {
    tasks.push(processTikTokEmbeds());
  }

  return Promise.all(tasks).then(() => undefined);
};

const renderInstagramEmbed = (container: HTMLDivElement, canonicalUrl: string) => {
  const blockquote = document.createElement("blockquote");
  blockquote.className = "instagram-media";
  blockquote.setAttribute("data-instgrm-captioned", "");
  blockquote.setAttribute("data-instgrm-permalink", `${canonicalUrl}?utm_source=ig_embed&utm_campaign=loading`);
  blockquote.setAttribute("data-instgrm-version", "14");
  blockquote.style.background = "#fff";
  blockquote.style.border = "0";
  blockquote.style.borderRadius = "3px";
  blockquote.style.boxShadow = "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)";
  blockquote.style.margin = "1px";
  blockquote.style.maxWidth = "658px";
  blockquote.style.minWidth = "326px";
  blockquote.style.padding = "0";
  blockquote.style.width = "calc(100% - 2px)";
  container.appendChild(blockquote);
};

const renderTikTokEmbed = (
  container: HTMLDivElement,
  canonicalUrl: string,
  videoId?: string,
  authorPath?: string,
) => {
  const blockquote = document.createElement("blockquote");
  blockquote.className = "tiktok-embed";
  blockquote.setAttribute("cite", canonicalUrl);
  if (videoId) blockquote.setAttribute("data-video-id", videoId);
  blockquote.style.maxWidth = "605px";
  blockquote.style.minWidth = "325px";

  const section = document.createElement("section");
  const link = document.createElement("a");
  link.target = "_blank";
  link.title = authorPath?.split("/").filter(Boolean).pop() || "TikTok";
  link.href = authorPath || canonicalUrl;
  link.textContent = link.title;
  section.appendChild(link);
  blockquote.appendChild(section);
  container.appendChild(blockquote);
};

const renderFacebookEmbed = (container: HTMLDivElement, canonicalUrl: string) => {
  ensureFacebookRoot();

  const embed = document.createElement("div");
  embed.className = "fb-video";
  embed.setAttribute("data-href", canonicalUrl);
  embed.setAttribute("data-allowfullscreen", "true");
  embed.setAttribute("data-show-text", "false");
  embed.setAttribute("data-width", String(getFacebookEmbedWidth(container)));
  container.appendChild(embed);
};

const loadInstagramScript = () => {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.instgrm?.Embeds?.process) return Promise.resolve();
  if (instagramScriptPromise) return instagramScriptPromise;

  instagramScriptPromise = loadExternalScript("instagram-embed-script", "https://platform.instagram.com/en_US/embeds.js");
  return instagramScriptPromise;
};

const loadFacebookSdk = () => {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.FB?.XFBML?.parse) return Promise.resolve();
  if (facebookScriptPromise) return facebookScriptPromise;

  facebookScriptPromise = new Promise((resolve, reject) => {
    ensureFacebookRoot();

    window.fbAsyncInit = () => resolve();

    const existing = document.getElementById("facebook-jssdk") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar Facebook SDK")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v22.0";
    script.onerror = () => reject(new Error("Falha ao carregar Facebook SDK"));
    document.body.appendChild(script);
  });

  return facebookScriptPromise;
};

const processInstagramEmbeds = (container: Element) => {
  return loadInstagramScript().then(() => {
    window.instgrm?.Embeds?.process?.();
    return undefined;
  });
};

const processFacebookEmbeds = (container: Element) => {
  return loadFacebookSdk().then(() => {
    window.FB?.XFBML?.parse(container);
    return undefined;
  });
};

const processTikTokEmbeds = () => {
  return loadTikTokScript(true);
};

const loadExternalScript = (id: string, src: string) => {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Falha ao carregar ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = src;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.body.appendChild(script);
  });
};

const loadTikTokScript = (forceReload = false) => {
  if (forceReload) {
    document.getElementById("tiktok-embed-script")?.remove();
  }
  return loadExternalScript("tiktok-embed-script", "https://www.tiktok.com/embed.js");
};

const ensureFacebookRoot = () => {
  if (document.getElementById("fb-root")) return;
  const root = document.createElement("div");
  root.id = "fb-root";
  document.body.prepend(root);
};

const getFacebookEmbedWidth = (container: HTMLDivElement) => {
  const width = Math.round(container.clientWidth || 560);
  return Math.min(Math.max(width, 220), 560);
};