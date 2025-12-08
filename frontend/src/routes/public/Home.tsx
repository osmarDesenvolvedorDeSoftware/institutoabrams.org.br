import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { SeoHelmet } from "../../components/seo/SeoHelmet";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "../../utils/seoDefaults";

export const Home = () => {
  const { t } = useTranslation();

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
            {t("heroTitle")}
          </h1>
          <div className="divider" />
          <p style={{ margin: 0, fontSize: "1.08rem", color: "var(--muted)" }}>
            {t("heroSubtitle")}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="btn btn-primary" to="/contato">
              {t("ctaPrimary")}
            </Link>
            <Link className="btn btn-ghost" to="/projetos">
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>
        <div className="card" style={{ background: "#fff", padding: "1.35rem", borderRadius: 14, display: "grid", gap: "0.75rem" }}>
          <h3 style={{ marginTop: 0 }}>{t("highlightsTitle", { defaultValue: "Destaques" })}</h3>
          <div className="divider" />
          <ul style={{ margin: 0, paddingLeft: "1.25rem", lineHeight: 1.8, color: "var(--muted)" }}>
            <li>{t("highlight1", { defaultValue: "Programas de bolsas e desenvolvimento" })}</li>
            <li>{t("highlight2", { defaultValue: "Parcerias com empresas e universidades" })}</li>
            <li>{t("highlight3", { defaultValue: "Conteúdos formativos e mentorias" })}</li>
          </ul>
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
              <h2 style={{ margin: 0 }}>{t("home.instituteHighlightsSubtitle", { defaultValue: "Ações em evidência" })}</h2>
              <div className="divider" />
            </div>
            <Link className="btn btn-ghost" to="/projetos">
              {t("common.seeAll")}
            </Link>
          </div>

          <div className="grid three">
            {[
              { title: "Clubinho da Leitura", slug: "clubinho-da-leitura" },
              { title: "Igualdade de Gênero", slug: "igualdade-de-genero" },
              { title: "Mentorias Profissionais", slug: "mentorias-profissionais" },
            ].map((item) => (
              <Link key={item.slug} to={`/pages/${item.slug}`} className="card" style={{ display: "grid", gap: "0.55rem" }}>
                <p className="subtitle" style={{ margin: 0 }}>{t("home.projectLabel", { defaultValue: "Projeto" })}</p>
                <h3 style={{ margin: 0 }}>{item.title}</h3>
                <p style={{ margin: 0, color: "var(--muted)" }}>
                  {t("home.projectPlaceholder", { defaultValue: "Conteúdo em construção. Saiba mais em breve." })}
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
    </div>
  );
};
