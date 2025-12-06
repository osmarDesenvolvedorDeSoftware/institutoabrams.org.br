import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { api } from "../../services/api";

type Banner = {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
};

export const Home = () => {
  const { t } = useTranslation();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    api
      .get("/public/banners", { params: { limit: 10 } })
      .then(({ data }) => setBanners(data || []))
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (!banners.length) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 6500);
    return () => clearInterval(id);
  }, [banners]);

  return (
    <div className="container" style={{ padding: "3.25rem 0", display: "grid", gap: "3.5rem" }}>
      {banners.length > 0 && (
        <section
          className="card"
          style={{
            padding: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "relative",
              minHeight: 260,
              background: `url(${banners[activeIndex]?.image_url}) center/cover no-repeat`,
              display: "grid",
              alignItems: "center",
              padding: "2rem",
            }}
          >
            <div
              style={{
                background: "rgba(0,0,0,0.45)",
                color: "#fff",
                borderRadius: 12,
                padding: "1.25rem 1.5rem",
                maxWidth: 520,
                display: "grid",
                gap: "0.35rem",
              }}
            >
              <h2 style={{ margin: 0 }}>{banners[activeIndex]?.title}</h2>
              {banners[activeIndex]?.subtitle && <p style={{ margin: 0 }}>{banners[activeIndex]?.subtitle}</p>}
              {banners[activeIndex]?.link_url && (
                banners[activeIndex].link_url.startsWith("http") ? (
                  <a
                    href={banners[activeIndex].link_url}
                    className="btn btn-primary"
                    style={{ width: "fit-content" }}
                  >
                    {t("common.learnMore", { defaultValue: "Saiba mais" })}
                  </a>
                ) : (
                  <Link
                    to={banners[activeIndex].link_url || "#"}
                    className="btn btn-primary"
                    style={{ width: "fit-content" }}
                  >
                    {t("common.learnMore", { defaultValue: "Saiba mais" })}
                  </Link>
                )
              )}
            </div>
            <div
              style={{
                position: "absolute",
                inset: "auto 1rem 1rem 1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.35rem" }}>
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    aria-label={`Ir para banner ${idx + 1}`}
                    onClick={() => setActiveIndex(idx)}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      border: "none",
                      background: idx === activeIndex ? "#fff" : "rgba(255,255,255,0.5)",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                  style={{ padding: "0.4rem 0.7rem" }}
                >
                  ‹
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setActiveIndex((prev) => (prev + 1) % banners.length)}
                  style={{ padding: "0.4rem 0.7rem" }}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

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
        <div
          className="card"
          style={{ background: "#fff", padding: "1.35rem", borderRadius: 14, display: "grid", gap: "0.75rem" }}
        >
          <h3 style={{ marginTop: 0 }}>{t("highlightsTitle", { defaultValue: "Destaques" })}</h3>
          <div className="divider" />
          <ul style={{ margin: 0, paddingLeft: "1.25rem", lineHeight: 1.8, color: "var(--muted)" }}>
            <li>{t("highlight1", { defaultValue: "Programas de bolsas e desenvolvimento" })}</li>
            <li>{t("highlight2", { defaultValue: "Parcerias com empresas e universidades" })}</li>
            <li>{t("highlight3", { defaultValue: "Conteúdos formativos e mentorias" })}</li>
          </ul>
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
          {["Mentorias de carreira", "Trilhas digitais", "Programas sociais"].map((item) => (
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
