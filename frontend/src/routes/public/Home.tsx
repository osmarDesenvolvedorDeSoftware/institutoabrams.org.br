import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { SeoHelmet } from "../../components/seo/SeoHelmet";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "../../utils/seoDefaults";
import { api } from "../../services/api";
import { SectionRenderer } from "../../components/SectionRenderer";

type Page = {
  id: number;
  slug: string;
  title_translations: Record<string, string>;
  content_translations?: Record<string, string>;
  hero_image_url?: string | null;
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

  const sections = homeContent?.sections || [];
  const heroSection = sections.find((s: any) => s?.type === "hero") || null;
  const textSection = sections.find((s: any) => s?.type === "text") || null;
  const extraSections = sections.filter((s: any) => s?.type !== "hero" && s?.type !== "text");

  const highlightPages = useMemo(() => {
    const menuList = menus.length && (menus as any)[0]?.items ? (menus as any)[0].items : menus;
    const parents = (menuList as MenuItem[]).filter((m) => !m.parent_id);
    const sorted = parents.sort((a, b) => (a.order || 0) - (b.order || 0));
    const mapped = sorted
      .map((m) => {
        const slug = m.target?.startsWith("/pages/") ? m.target.replace("/pages/", "") : null;
        if (!slug || slug === "home-content") return null;
        const page = pages.find((p) => p.slug === slug);
        return page ? { page, order: m.order || 0 } : null;
      })
      .filter(Boolean) as { page: Page; order: number }[];
    return mapped.slice(0, 3).map((item) => item.page);
  }, [menus, pages]);

  const getLocalized = (translations: Record<string, string> | undefined, lang: string) =>
    translations?.[lang] || translations?.[lang?.slice(0, 2)] || translations?.["pt"];

  const heroTitle = heroSection?.title || t("heroTitle");
  const heroSubtitle = heroSection?.subtitle || t("heroSubtitle");
  const heroCtaLabel = heroSection?.cta_label || t("ctaPrimary");
  const heroCtaLink = heroSection?.cta_link || "/contato";
  const introText = textSection?.content;

  return (
    <div className="container" style={{ padding: "3.25rem 0", display: "grid", gap: "3.5rem" }}>
      <SeoHelmet title={DEFAULT_TITLE} description={DEFAULT_DESCRIPTION} />

      <section
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
          <h1 className="title-centered" style={{ textAlign: "center", marginBottom: "0.25rem" }}>
            {heroTitle}
          </h1>
          <div className="divider" />
          <p style={{ margin: 0, fontSize: "1.08rem", color: "var(--muted)" }}>
            {heroSubtitle}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="btn btn-primary" to={heroCtaLink}>
              {heroCtaLabel}
            </Link>
            <Link className="btn btn-ghost" to="/projetos">
              {t("ctaSecondary")}
            </Link>
          </div>
        {heroSection?.image && (
            <img
              src={heroSection.image}
              alt={heroSection.title || "Hero"}
              style={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 12 }}
            />
          )}
        </div>
        <div className="card" style={{ background: "#fff", padding: "1.35rem", borderRadius: 14, display: "grid", gap: "0.75rem" }}>
          <h3 style={{ marginTop: 0 }}>{t("highlightsTitle", { defaultValue: "Destaques" })}</h3>
          <div className="divider" />
          {introText ? (
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>{introText}</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: "1.25rem", lineHeight: 1.8, color: "var(--muted)" }}>
            <li>{t("highlight1", { defaultValue: "Programas de bolsas e desenvolvimento" })}</li>
            <li>{t("highlight2", { defaultValue: "Parcerias com empresas e universidades" })}</li>
            <li>{t("highlight3", { defaultValue: "Conteúdos formativos e mentorias" })}</li>
          </ul>
          )}
        </div>
      </section>

      <section className="card" style={{ background: "var(--color-bg-muted)" }}>
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <div>
            <p className="subtitle" style={{ marginBottom: "0.15rem" }}>{t("home.pillarsTitle", { defaultValue: "Nossos Pilares" })}</p>
            <h2 style={{ margin: 0 }}>{t("home.pillarsSubtitle", { defaultValue: "Impacto que guia nossas ações" })}</h2>
            <div className="divider" />
          </div>
          <div className="grid three">
            {[
              { title: t("home.pillarEducationTitle", { defaultValue: "Educação e Cultura" }), text: t("home.pillarEducationText", { defaultValue: "Leitura, arte e conhecimento para formar cidadãos conscientes." }) },
              { title: t("home.pillarEquityTitle", { defaultValue: "Equidade e Inclusão" }), text: t("home.pillarEquityText", { defaultValue: "Projetos que promovem igualdade de gênero e oportunidades." }) },
              { title: t("home.pillarCareerTitle", { defaultValue: "Carreira e Futuro" }), text: t("home.pillarCareerText", { defaultValue: "Trilhas e mentorias para impulsionar trajetórias profissionais." }) },
            ].map((pillar) => (
              <div key={pillar.title} className="card" style={{ display: "grid", gap: "0.5rem" }}>
                <h3 style={{ margin: 0 }}>{pillar.title}</h3>
                <p style={{ margin: 0, color: "var(--muted)" }}>{pillar.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ padding: 0 }}>
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <p className="subtitle" style={{ marginBottom: "0.15rem" }}>{t("home.instituteHighlightsTitle", { defaultValue: "Destaques do Instituto" })}</p>
              <h2 style={{ margin: 0 }}>{t("home.instituteHighlightsSubtitle", { defaultValue: "Acoes em evidencia" })}</h2>
              <div className="divider" />
            </div>
            <Link className="btn btn-ghost" to="/projetos">
              {t("common.seeAll")}
            </Link>
          </div>

          <div className="grid three">
            {(highlightPages.length
              ? highlightPages.map((page) => ({
                  title: getLocalized(page.title_translations, i18n.language) || page.slug,
                  slug: page.slug,
                  desc: getLocalized(page.content_translations, i18n.language),
                }))
              : [
                  { title: "Clubinho da Leitura", slug: "clubinho-da-leitura", desc: t("home.projectPlaceholder", { defaultValue: "Conteudo em construcao. Saiba mais em breve." }) },
                  { title: "Igualdade de Genero", slug: "igualdade-de-genero", desc: t("home.projectPlaceholder", { defaultValue: "Conteudo em construcao. Saiba mais em breve." }) },
                  { title: "Mentorias Profissionais", slug: "mentorias-profissionais", desc: t("home.projectPlaceholder", { defaultValue: "Conteudo em construcao. Saiba mais em breve." }) },
                ]
            ).map((item) => (
              <Link key={item.slug} to={`/pages/${item.slug}`} className="card" style={{ display: "grid", gap: "0.55rem" }}>
                <p className="subtitle" style={{ margin: 0 }}>{t("home.projectLabel", { defaultValue: "Projeto" })}</p>
                <h3 style={{ margin: 0 }}>{item.title}</h3>
                <p style={{ margin: 0, color: "var(--muted)" }}>
                  {item.desc || t("home.projectPlaceholder", { defaultValue: "Conteudo em construcao. Saiba mais em breve." })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ display: "grid", gap: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0, marginBottom: "0.35rem" }}>
              {t("projectsTitle", { defaultValue: "Projetos em andamento" })}
            </h2>
            <div className="divider" />
          </div>
          <Link to="/projetos" className="btn btn-ghost">
            {t("common.seeAll")}
          </Link>
        </div>
        <div className="grid three" style={{ marginTop: "0.5rem", gap: "1.25rem" }}>
          {[t("home.placeholderProject1", { defaultValue: "Mentorias de carreira" }), t("home.placeholderProject2", { defaultValue: "Trilhas digitais" }), t("home.placeholderProject3", { defaultValue: "Programas sociais" })].map((item) => (
            <div
              key={item}
              className="card"
              style={{
                background: "#fff",
                padding: "1.35rem",
                borderRadius: 14,
                display: "grid",
                gap: "0.65rem",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "0.25rem" }}>{item}</h3>
              <p style={{ margin: 0, color: "var(--muted)" }}>
                {t("projectPlaceholder", {
                  defaultValue: "Iniciativas que conectam pessoas, oportunidades e impacto direto na comunidade.",
                })}
              </p>
              <Link to="/projetos" className="btn btn-ghost">
                {t("common.learnMore")}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <p className="subtitle" style={{ marginBottom: "0.15rem" }}>{t("home.followWorkTitle", { defaultValue: "Acompanhe nosso trabalho" })}</p>
            <h2 style={{ margin: 0 }}>{t("home.followWorkSubtitle", { defaultValue: "Projetos e notícias" })}</h2>
            <div className="divider" />
          </div>
          <Link to="/noticias" className="btn btn-ghost">
            {t("home.followWorkNewsCta", { defaultValue: "Ver notícias" })}
          </Link>
        </div>
        <div className="grid two" style={{ marginTop: "0.5rem" }}>
          {[{ title: t("projectsTitle", { defaultValue: "Projetos" }), desc: t("projectPlaceholder", { defaultValue: "Conheça as iniciativas que conectam pessoas e oportunidades." }), href: "/projetos" }, { title: t("footer.news", { defaultValue: "Notícias" }), desc: t("projectPlaceholder", { defaultValue: "Atualizações, eventos e comunicados oficiais do Instituto ABRAMS." }), href: "/noticias" }].map((item) => (
            <div key={item.title} className="card" style={{ display: "grid", gap: "0.5rem" }}>
              <h3 style={{ margin: 0 }}>{item.title}</h3>
              <p style={{ margin: 0, color: "var(--muted)" }}>{item.desc}</p>
              <Link to={item.href} className="btn btn-ghost" style={{ width: "fit-content" }}>
                {t("common.learnMore", { defaultValue: "Saiba mais" })}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {extraSections?.length ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <SectionRenderer sections={extraSections} />
        </section>
      ) : null}
    </div>
  );
};
