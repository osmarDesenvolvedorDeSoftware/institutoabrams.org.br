import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { api } from "../../services/api";
import { getLocalized } from "../../utils/content";
import { getYoutubeEmbedUrl, resolveMediaUrl } from "../../utils/media";
import { SeoHelmet } from "../../components/seo/SeoHelmet";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "../../utils/seoDefaults";

type Page = {
  slug: string;
  title_translations: Record<string, string>;
  content_translations: Record<string, string>;
  category?: string | null;
  hero_image_url?: string | null;
  gallery_urls?: string[] | null;
  video_url?: string | null;
};

type Props = {
  slugOverride?: string;
};

export const PublicPage = ({ slugOverride }: Props = {}) => {
  const { slug } = useParams();
  const { i18n, t } = useTranslation();
  const [page, setPage] = useState<Page | null>(null);
  const [notFound, setNotFound] = useState(false);
  const currentSlug = slugOverride || slug;

  useEffect(() => {
    if (!currentSlug) return;
    api
      .get(`/pages/slug/${currentSlug}`)
      .then(({ data }) => {
        setPage(data);
        setNotFound(false);
      })
      .catch(() => setNotFound(true));
  }, [currentSlug]);

  if (notFound) {
    return (
      <div className="container section">
        <h2>{t("common.notFound", { defaultValue: "Página não encontrada" })}</h2>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container section">
        <p>{t("common.loading", { defaultValue: "Carregando..." })}</p>
      </div>
    );
  }

  const title = getLocalized(page.title_translations, i18n.language);
  const content = getLocalized(page.content_translations, i18n.language);
  const embedUrl = getYoutubeEmbedUrl(page.video_url);
  const description = content ? content.replace(/<[^>]+>/g, "").slice(0, 180) : DEFAULT_DESCRIPTION;

  return (
    <div className="container section" style={{ display: "grid", gap: "1rem" }}>
      <SeoHelmet
        title={title || DEFAULT_TITLE}
        description={description}
        image={page.hero_image_url}
        url={currentSlug ? `/pages/${currentSlug}` : undefined}
      />
      {page.hero_image_url && (
        <img
          src={resolveMediaUrl(page.hero_image_url)}
          alt={title}
          style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 14 }}
        />
      )}
      <h2>{title}</h2>
      <div className="divider" />
      <div style={{ color: "var(--muted)", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: content || "" }} />
      {embedUrl && (
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
              src={embedUrl}
              title={t("publicPage.videoTitle", { defaultValue: "Vídeo do projeto" })}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            />
          </div>
        </div>
      )}
      {page.gallery_urls && page.gallery_urls.length > 0 && (
        <div className="grid two" style={{ gap: "0.75rem" }}>
          {page.gallery_urls.map((url, idx) => (
            <img
              key={idx}
              src={resolveMediaUrl(url)}
              alt={t("publicPage.galleryAlt", { defaultValue: `Galeria ${idx + 1}`, index: idx + 1 })}
              style={{ width: "100%", borderRadius: 12, objectFit: "cover", maxHeight: 220 }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
