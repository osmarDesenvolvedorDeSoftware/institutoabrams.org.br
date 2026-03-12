import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { SeoHelmet } from "../../components/seo/SeoHelmet";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "../../utils/seoDefaults";
import { api } from "../../services/api";
import { resolveMediaUrl } from "../../utils/media";
import heroBanner from "../../assets/paidin/hero/banner.png";
import heroStar from "../../assets/paidin/hero/star.svg";
import heroLine from "../../assets/paidin/hero/lineone.svg";

type Page = {
  id: number;
  slug: string;
  title_translations: Record<string, string>;
  content_translations?: Record<string, any>;
  hero_image_url?: string | null;
  gallery_urls?: string[] | null;
  is_published?: boolean;
  created_at?: string;
  category?: string | null;
};

type MenuItem = {
  id: number;
  label: string;
  target: string;
  parent_id?: number | null;
  order?: number;
};

export const Home = () => {
  const { t, i18n } = useTranslation();
  const [homeContent, setHomeContent] = useState<any | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      api.get("/pages/slug/home-content").catch(() => null),
      api.get("/pages").catch(() => null),
      api.get("/menus").catch(() => null),
    ])
      .then(([homeResp, pagesResp, menusResp]) => {
        if (!mounted) return;
        setHomeContent(homeResp?.data || null);
        setPages((pagesResp?.data?.items as Page[]) || (pagesResp?.data as Page[]) || []);
        setMenus((menusResp?.data?.items as MenuItem[]) || (menusResp?.data as MenuItem[]) || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const sections =
    homeContent?.sections ||
    homeContent?.content_translations?.sections ||
    homeContent?.content_translations?.[i18n.language]?.sections ||
    homeContent?.content_translations?.[i18n.language?.slice(0, 2)]?.sections ||
    [];
  const heroSection = sections.find((s: any) => s?.type === "hero") || null;
  const heroImage =
    heroSection?.image || heroSection?.image_url || heroSection?.hero_image_url || homeContent?.hero_image_url;
  const heroImageResolved = heroImage ? resolveMediaUrl(heroImage) : heroBanner;

  const visiblePages = useMemo(
    () => pages.filter((p) => p.slug !== "home-content" && p.is_published !== false),
    [pages],
  );

  const latestPages = useMemo(() => {
    const sorted = [...visiblePages].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
    return sorted.slice(0, 8);
  }, [visiblePages]);

  const featuredCount = Math.min(4, latestPages.length);
  const featuredPages = latestPages.slice(0, featuredCount);
  const remainingPages = latestPages.slice(1, 8);

  useEffect(() => {
    if (featuredPages.length <= 1) return;
    const interval = window.setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredPages.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, [featuredPages.length]);

  useEffect(() => {
    if (featuredIndex >= featuredPages.length) {
      setFeaturedIndex(0);
    }
  }, [featuredIndex, featuredPages.length]);

  const getLocalized = (translations: Record<string, string> | undefined, lang: string) =>
    translations?.[lang] || translations?.[lang?.slice(0, 2)] || translations?.["pt"];

  const heroTitle = heroSection?.title;
  const heroSubtitle = heroSection?.subtitle;
  const heroCtaLabel = heroSection?.cta_label;
  const heroCtaLink = heroSection?.cta_link;
  const hasHtmlTags = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

  const renderSection = (section: any, index: number) => {
    if (!section || typeof section !== "object") return null;
    if (section.type === "hero") {
      if (!heroTitle && !heroSubtitle && !heroImage) return null;
      return (
        <section key={`hero-${index}`} className="hero-premium">
          <img src={heroStar} alt="" className="hero-premium__decor hero-premium__decor--star" />
          <img src={heroLine} alt="" className="hero-premium__decor hero-premium__decor--line" />
          <div className="hero-premium__content">
            <span className="pill">{t("heroTagline", { defaultValue: "Instituto ABRAMS" })}</span>
            {heroTitle ? <h1>{heroTitle}</h1> : null}
            {heroSubtitle ? <p>{heroSubtitle}</p> : null}
            {heroCtaLabel && heroCtaLink ? (
              <div className="hero-premium__actions">
                <Link className="btn btn-primary" to={heroCtaLink}>
                  {heroCtaLabel}
                </Link>
              </div>
            ) : null}
          </div>
          <div className="hero-premium__media">
            <img src={heroImageResolved} alt={heroTitle || "Hero"} />
          </div>
        </section>
      );
    }
    if (section.type === "text") {
      if (!section.content) return null;
      const rawContent = String(section.content);
      const contentHtml = hasHtmlTags(rawContent) ? rawContent : rawContent.replace(/\n/g, "<br />");
      return (
        <section key={`text-${index}`} className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.75rem" }}>
          <div className="divider" />
          <div
            className="rich-content"
            style={{ color: "var(--muted)", lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </section>
      );
    }
    if (section.type === "image") {
      if (!section.image_url) return null;
      return (
        <section key={`image-${index}`} className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.75rem" }}>
          <img
            src={section.image_url}
            alt={section.caption || "Imagem"}
            style={{ width: "100%", objectFit: "cover", borderRadius: 12 }}
          />
          {section.caption ? (
            <p style={{ margin: 0, color: "var(--muted)", textAlign: "center" }}>{section.caption}</p>
          ) : null}
        </section>
      );
    }
    return null;
  };

  const getInitials = (text: string) => {
    const clean = text.trim().split(/\s+/).slice(0, 2);
    return clean.map((part) => part[0]).join("").toUpperCase();
  };

  const getPreviewImage = (item: Page) => item.hero_image_url || item.gallery_urls?.[0] || null;

  const renderHighlightCard = (item: Page, isCarousel = false) => {
    const title = getLocalized(item.title_translations, i18n.language) || item.slug;
    const descRaw = getLocalized(item.content_translations as any, i18n.language) || "";
    const desc = descRaw ? descRaw.replace(/<[^>]+>/g, "").slice(0, isCarousel ? 160 : 120) : "";
    const previewImage = getPreviewImage(item);
    const imageUrl = previewImage ? resolveMediaUrl(previewImage) : null;
    const badgeLabel = title;
    return (
      <Link
        key={item.slug}
        to={`/pages/${item.slug}`}
        className={`latest-card${isCarousel ? " latest-card--carousel" : ""}`}
      >
        <div
          className={`latest-card__media${imageUrl ? "" : " placeholder"}`}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        >
          {!imageUrl && <span>{getInitials(title)}</span>}
          <span className="latest-card__badge">{badgeLabel}</span>
        </div>
        <div className="latest-card__body">
          <h3>{title}</h3>
          {desc ? <p>{desc}</p> : null}
          <span className="latest-card__cta">Ver mais →</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="container" style={{ padding: "3.25rem 0", display: "grid", gap: "3.5rem" }}>
      <SeoHelmet title={DEFAULT_TITLE} description={DEFAULT_DESCRIPTION} />

      {sections.map((section: any, index: number) => renderSection(section, index))}

      {latestPages.length ? (
        <section className="section" style={{ padding: 0 }}>
          <div style={{ display: "grid", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <p className="subtitle" style={{ marginBottom: "0.15rem" }}>
                  {t("home.latestTitle", { defaultValue: "Destaques recentes" })}
                </p>
                <h2 style={{ margin: 0 }}>{t("home.latestSubtitle", { defaultValue: "Novidades do instituto" })}</h2>
                <div className="divider" />
              </div>
            </div>

            <div className="latest-grid">
              {featuredPages[featuredIndex] ? (
                <div className="latest-carousel-slot latest-carousel-slot--featured">
                  {renderHighlightCard(featuredPages[featuredIndex], true)}
                  {featuredPages.length > 1 && (
                    <div className="latest-carousel__controls">
                      <button
                        className="carousel-btn"
                        type="button"
                        aria-label="Anterior"
                        onClick={() =>
                          setFeaturedIndex((prev) => (prev - 1 + featuredPages.length) % featuredPages.length)
                        }
                      >
                        ‹
                      </button>
                      <button
                        className="carousel-btn"
                        type="button"
                        aria-label="Proximo"
                        onClick={() => setFeaturedIndex((prev) => (prev + 1) % featuredPages.length)}
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
              {remainingPages.map((page) => renderHighlightCard(page))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};
