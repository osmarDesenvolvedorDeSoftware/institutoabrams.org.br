import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const projects = [
  {
    title: "Residências Criativas",
    summary: "Experiências imersivas com artistas e mentores convidados.",
  },
  {
    title: "Trilhas Tech",
    summary: "Capacitação em tecnologia e inovação com parceiros do mercado.",
  },
  {
    title: "Formação de Lideranças",
    summary: "Workshops e encontros para fortalecer lideranças comunitárias.",
  },
];

export const Projects = () => {
  const { t } = useTranslation();
  return (
    <div className="container section">
      <h2 style={{ marginTop: 0 }}>{t("projectsPageTitle", { defaultValue: "Projetos" })}</h2>
      <div className="divider" />
      <p className="subtitle">
        {t("projectsPageSubtitle", {
          defaultValue:
            "Iniciativas que conectam pessoas, oportunidades e impacto direto nas comunidades.",
        })}
      </p>
      <div className="grid two" style={{ marginTop: "1.5rem" }}>
        {projects.map((project) => (
          <div key={project.title} className="card" style={{ display: "grid", gap: "0.5rem" }}>
            <h3 style={{ marginTop: 0 }}>{project.title}</h3>
            <p style={{ margin: 0, color: "var(--muted)" }}>{project.summary}</p>
            <Link to="/projetos" className="btn btn-ghost" style={{ justifySelf: "flex-start" }}>
              {t("learnMore", { defaultValue: "Saiba mais" })}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
