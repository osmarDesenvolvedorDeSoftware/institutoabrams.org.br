import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { api } from "../../services/api";
import { getLocalized } from "../../utils/content";
import { resolveMediaUrl } from "../../utils/media";
import { SeoHelmet } from "../../components/seo/SeoHelmet";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "../../utils/seoDefaults";

type PageProject = {
  id: number;
  slug: string;
  title_translations: Record<string, string>;
  content_translations: Record<string, string>;
  hero_image_url?: string | null;
  video_url?: string | null;
};

const fallbackProjects = (t: (key: string, opts?: any) => string) => [
  {
    title: t("home.placeholderProject1", { defaultValue: "Mentorias de carreira" }),
    summary: t("projectPlaceholder", {
      defaultValue: "Iniciativas que conectam pessoas, oportunidades e impacto direto na comunidade.",
    }),
  },
  {
    title: t("home.placeholderProject2", { defaultValue: "Trilhas digitais" }),
    summary: t("projectPlaceholder", {
      defaultValue: "Iniciativas que conectam pessoas, oportunidades e impacto direto na comunidade.",
    }),
  },
  {
    title: t("home.placeholderProject3", { defaultValue: "Programas sociais" }),
    summary: t("projectPlaceholder", {
      defaultValue: "Iniciativas que conectam pessoas, oportunidades e impacto direto na comunidade.",
    }),
  },
];

export const Projects = () => {
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState<PageProject[]>([]);

  useEffect(() => {
    api
      .get("/pages", { params: { category: "projeto", per_page: 50 } })
      .then(({ data }) => setProjects(data.items || data))
      .catch(() => setProjects([]));
  }, []);

  const renderList = projects.length
    ? projects.map((project) => {
        const title = getLocalized(project.title_translations, i18n.language);
        const summary = getLocalized(project.content_translations, i18n.language);
        return (
          <div
            key={project.id}
            className="card"
            style={{
              display: "grid",
              gap: "0.65rem",
              background: "#fff",
              padding: "1.35rem",
              borderRadius: 14,
            }}
          >
            {project.hero_image_url && (
              <img
                src={resolveMediaUrl(project.hero_image_url)}
                alt={title}
                style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12 }}
              />
            )}
            <h3 style={{ marginTop: 0, marginBottom: "0.25rem" }}>{title}</h3>
            <p style={{ margin: 0, color: "var(--muted)" }} dangerouslySetInnerHTML={{ __html: summary || "" }} />
            <Link to={`/pages/${project.slug}`} className="btn btn-ghost" style={{ justifySelf: "flex-start" }}>
              {t("common.learnMore")}
            </Link>
          </div>
        );
      })
    : fallbackProjects(t).map((project) => (
        <div
          key={project.title}
          className="card"
          style={{
            display: "grid",
            gap: "0.65rem",
            background: "#fff",
            padding: "1.35rem",
            borderRadius: 14,
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "0.25rem" }}>{project.title}</h3>
          <p style={{ margin: 0, color: "var(--muted)" }}>{project.summary}</p>
          <Link to="/projetos" className="btn btn-ghost" style={{ justifySelf: "flex-start" }}>
            {t("common.learnMore")}
          </Link>
        </div>
      ));

  return (
    <div className="container section" style={{ display: "grid", gap: "1.25rem" }}>
      <SeoHelmet
        title={t("projectsPageTitle", { defaultValue: "Projetos" }) || DEFAULT_TITLE}
        description={
          t("projectsPageSubtitle", {
            defaultValue: "Iniciativas que conectam pessoas, oportunidades e impacto direto nas comunidades.",
          }) || DEFAULT_DESCRIPTION
        }
      />
      <div>
        <h2 style={{ marginTop: 0, marginBottom: "0.35rem" }}>
          {t("projectsPageTitle", { defaultValue: "Projetos" })}
        </h2>
        <div className="divider" />
        <p className="subtitle">
          {t("projectsPageSubtitle", {
            defaultValue: "Iniciativas que conectam pessoas, oportunidades e impacto direto nas comunidades.",
          })}
        </p>
      </div>
      <div className="grid two" style={{ marginTop: "1.25rem", gap: "1.25rem" }}>
        {renderList}
      </div>
    </div>
  );
};
