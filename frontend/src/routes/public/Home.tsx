import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="container" style={{ padding: "3rem 0", display: "grid", gap: "3rem" }}>
      <section
        className="card"
        style={{
          display: "grid",
          gap: "1.5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          alignItems: "center",
          background: "linear-gradient(135deg, #fff9ec, #fff)",
        }}
      >
        <div style={{ display: "grid", gap: "1rem", textAlign: "center" }}>
          <span className="pill">{t("heroTagline", { defaultValue: "Instituto ABRAMS" })}</span>
          <h1 className="title-centered" style={{ textAlign: "center" }}>
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
        <div className="card" style={{ background: "var(--surface)" }}>
          <h3 style={{ marginTop: 0 }}>{t("highlightsTitle", { defaultValue: "Destaques" })}</h3>
          <div className="divider" />
          <ul style={{ margin: 0, paddingLeft: "1.25rem", lineHeight: 1.8, color: "var(--muted)" }}>
            <li>{t("highlight1", { defaultValue: "Programas de bolsas e desenvolvimento" })}</li>
            <li>{t("highlight2", { defaultValue: "Parcerias com empresas e universidades" })}</li>
            <li>{t("highlight3", { defaultValue: "Conteúdos formativos e mentorias" })}</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>{t("projectsTitle", { defaultValue: "Projetos em andamento" })}</h2>
            <div className="divider" />
          </div>
          <Link to="/projetos" className="btn btn-ghost">
            {t("common.seeAll")}
          </Link>
        </div>
        <div className="grid three" style={{ marginTop: "1rem" }}>
          {["Mentorias de carreira", "Trilhas digitais", "Programas sociais"].map((item) => (
            <div key={item} className="card">
              <h3 style={{ marginTop: 0 }}>{item}</h3>
              <p style={{ marginBottom: "0.5rem", color: "var(--muted)" }}>
                {t("projectPlaceholder", {
                  defaultValue:
                    "Iniciativas que conectam pessoas, oportunidades e impacto direto na comunidade.",
                })}
              </p>
              <Link to="/projetos" className="btn btn-ghost">
                {t("common.learnMore")}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
