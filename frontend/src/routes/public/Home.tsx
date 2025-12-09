import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { SeoHelmet } from "../../components/seo/SeoHelmet";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "../../utils/seoDefaults";
import { api } from "../../services/api";

type Page = {
  id: number;
  slug: string;
  title_translations: Record<string, string>;
  content_translations?: Record<string, any>;
  hero_image_url?: string | null;
  is_published?: boolean;
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

  const visiblePages = useMemo(
    () => pages.filter((p) => p.slug !== "home-content" && p.is_published !== false),
    [pages],
  );

  const highlightPages = useMemo(() => {
    const parents = menus.filter((m) => !m.parent_id);
    const sorted = parents.sort((a, b) => (a.order || 0) - (b.order || 0));
    const mapped = sorted
      .map((m) => {
        const slug = m.target?.startsWith("/pages/") ? m.target.replace("/pages/", "") : null;
        if (!slug || slug === "home-content") return null;
        const page = visiblePages.find((p) => p.slug === slug);
        return page ? { page, order: m.order || 0 } : null;
      })
      .filter(Boolean) as { page: Page; order: number }[];
    return mapped.map((item) => item.page);
  }, [menus, visiblePages]);

  const getLocalized = (translations: Record<string, string> | undefined, lang: string) =>
    translations?.[lang] || translations?.[lang?.slice(0, 2)] || translations?.["pt"];

  const heroTitle = heroSection?.title;
  const heroSubtitle = heroSection?.subtitle;
  const heroCtaLabel = heroSection?.cta_label;
  const heroCtaLink = heroSection?.cta_link;

  const renderSection = (section: any, index: number) => {
    if (!section || typeof section !== "object") return null;
    if (section.type === "hero") {
      if (!heroTitle && !heroSubtitle && !heroImage) return null;
      return (
        <section
          key={`hero-${index}`}
          className="card"
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            alignItems: "center",
            background: "linear-gradient(135deg, #fff9ec, #fff)",
            padding: "2rem",
          }}
        >
          <div style={{ display: "grid", gap: "1rem", textAlign: "center" }}>
            <span className="pill">{t("heroTagline", { defaultValue: "Instituto ABRAMS" })}</span>
            {heroTitle ? (
              <h1 className="title-centered" style={{ textAlign: "center", marginBottom: "0.25rem" }}>
                {heroTitle}
              </h1>
            ) : null}
            {(heroTitle || heroSubtitle) && <div className="divider" />}
            {heroSubtitle ? (
              <p style={{ margin: 0, fontSize: "1.08rem", color: "var(--muted)" }}>{heroSubtitle}</p>
            ) : null}
            {heroCtaLabel && heroCtaLink ? (
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
                <Link className="btn btn-primary" to={heroCtaLink}>
                  {heroCtaLabel}
                </Link>
              </div>
            ) : null}
          {heroImage && (
              <img
                src={heroImage}
                alt={heroTitle || "Hero"}
                style={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 12 }}
              />
            )}
          </div>
        </section>
      );
    }
    if (section.type === "text") {
      if (!section.content) return null;
      return (
        <section key={`text-${index}`} className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.75rem" }}>
          <div className="divider" />
          <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>{section.content}</div>
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

  const renderHighlightCard = (item: Page) => {
    const title = getLocalized(item.title_translations, i18n.language) || item.slug;
    const descRaw = getLocalized(item.content_translations as any, i18n.language) || "";
    const desc = descRaw ? descRaw.replace(/<[^>]+>/g, "").slice(0, 180) : "";
    return (
      <Link key={item.slug} to={`/pages/${item.slug}`} className="card" style={{ display: "grid", gap: "0.55rem" }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {desc ? <p style={{ margin: 0, color: "var(--muted)" }}>{desc}</p> : null}
      </Link>
    );
  };

  return (
    <div className="container" style={{ padding: "3.25rem 0", display: "grid", gap: "3.5rem" }}>
      <SeoHelmet title={DEFAULT_TITLE} description={DEFAULT_DESCRIPTION} />

      {sections.map((section: any, index: number) => renderSection(section, index))}

      {highlightPages.length ? (
        <section className="section" style={{ padding: 0 }}>
          <div style={{ display: "grid", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <p className="subtitle" style={{ marginBottom: "0.15rem" }}>{t("home.instituteHighlightsTitle", { defaultValue: "Destaques" })}</p>
                <h2 style={{ margin: 0 }}>{t("home.instituteHighlightsSubtitle", { defaultValue: "Selecionados pelo menu" })}</h2>
                <div className="divider" />
              </div>
            </div>

            <div className="grid three">
              {highlightPages.map((page) => renderHighlightCard(page))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};
