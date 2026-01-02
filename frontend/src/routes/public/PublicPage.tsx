import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { api } from "../../services/api";
import { getLocalized } from "../../utils/content";
import { getYoutubeEmbedUrl, resolveMediaUrl } from "../../utils/media";
import { SeoHelmet } from "../../components/seo/SeoHelmet";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "../../utils/seoDefaults";

type Page = {
  id: number;
  slug: string;
  title_translations: Record<string, string>;
  content_translations: Record<string, string>;
  category?: string | null;
  hero_image_url?: string | null;
  gallery_urls?: string[] | null;
  video_url?: string | null;
  likes_count?: number | null;
};

type Props = {
  slugOverride?: string;
};

export const PublicPage = ({ slugOverride }: Props = {}) => {
  const { slug } = useParams();
  const { i18n, t } = useTranslation();
  const [page, setPage] = useState<Page | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<
    { id: number; name: string; content: string; created_at: string }[]
  >([]);
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentStatus, setCommentStatus] = useState<string | null>(null);
  const currentSlug = slugOverride || slug;

  useEffect(() => {
    if (!currentSlug) return;
    if (currentSlug === "home-content") {
      setNotFound(true);
      return;
    }
    api
      .get(`/pages/slug/${currentSlug}`)
      .then(({ data }) => {
        setPage(data);
        setNotFound(false);
        setLikesCount(data.likes_count || 0);
      })
      .catch(() => setNotFound(true));
  }, [currentSlug]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShareUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (!page?.id) return;
    const stored = localStorage.getItem(`liked-page-${page.id}`);
    setLiked(stored === "1");
  }, [page?.id]);

  useEffect(() => {
    if (!currentSlug) return;
    api
      .get(`/comments/page/${currentSlug}`)
      .then(({ data }) => setComments(data || []))
      .catch(() => setComments([]));
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
  const shareText = encodeURIComponent(title || DEFAULT_TITLE);
  const shareLink = encodeURIComponent(shareUrl);
  const shareItems = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${shareText}%20${shareLink}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${shareLink}`,
    },
    {
      key: "instagram",
      label: "Instagram",
      href: `https://www.instagram.com/?url=${shareLink}`,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareLink}`,
    },
    {
      key: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${shareLink}&text=${shareText}`,
    },
  ];

  const handleLike = async () => {
    if (!page?.id || liked) return;
    try {
      const { data } = await api.post(`/pages/${page.id}/like`);
      setLikesCount(data.likes_count || likesCount + 1);
      setLiked(true);
      localStorage.setItem(`liked-page-${page.id}`, "1");
    } catch (error) {
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentName.trim() || !commentContent.trim()) {
      setCommentStatus("Preencha nome e comentario.");
      return;
    }
    setCommentStatus(null);
    try {
      const { data } = await api.post(`/comments/page/${page.slug}`, {
        name: commentName.trim(),
        email: commentEmail.trim() || null,
        content: commentContent.trim(),
      });
      setComments((prev) => [...prev, data]);
      setCommentName("");
      setCommentEmail("");
      setCommentContent("");
      setCommentStatus("Comentario enviado.");
    } catch (error) {
      setCommentStatus("Nao foi possivel enviar o comentario.");
    }
  };

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
      <div
        className="rich-content"
        style={{ color: "var(--muted)", lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: content || "" }}
      />
      <div className="page-actions">
        <div className="page-actions__group">
          <span className="page-actions__label">Curta e compartilhe</span>
          <div className="page-actions__buttons">
            <button className={`like-btn${liked ? " liked" : ""}`} type="button" onClick={handleLike}>
              {liked ? "Curtido" : "Curtir"} ({likesCount})
            </button>
            {shareItems.map((item) => (
              <a key={item.key} href={item.href} target="_blank" rel="noreferrer" className="share-btn">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
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
      <div className="page-comments">
        <h3>Comentarios</h3>
        {comments.length ? (
          <div className="page-comments__list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <strong>{comment.name}</strong>
                <p>{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--muted)" }}>Seja o primeiro a comentar.</p>
        )}
        <div className="comment-form">
          <input
            placeholder="Seu nome"
            value={commentName}
            onChange={(e) => setCommentName(e.target.value)}
          />
          <input
            placeholder="Seu e-mail (opcional)"
            value={commentEmail}
            onChange={(e) => setCommentEmail(e.target.value)}
          />
          <textarea
            placeholder="Escreva um comentario"
            rows={4}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <button className="btn btn-primary" type="button" onClick={handleSubmitComment}>
            Enviar comentario
          </button>
          {commentStatus && <small style={{ color: "var(--muted)" }}>{commentStatus}</small>}
        </div>
      </div>
    </div>
  );
};
