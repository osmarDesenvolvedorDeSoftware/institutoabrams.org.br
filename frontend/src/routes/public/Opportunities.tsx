import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { api } from "../../services/api";
import { getYoutubeEmbedUrl } from "../../utils/media";

type Opportunity = {
  id: number;
  title: string;
  description?: string;
  deadline?: string;
  category?: string;
  institution?: string;
  official_link?: string;
  image_url?: string;
  video_url?: string;
};

export const Opportunities = () => {
  const { t } = useTranslation();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    api
      .get("/opportunities", { params: { status: "open" } })
      .then(({ data }) => setOpportunities(data.items || data))
      .catch(() => setOpportunities([]));
  }, []);

  return (
    <div className="container section" style={{ display: "grid", gap: "1.25rem" }}>
      <div>
        <h2 style={{ margin: 0, marginBottom: "0.4rem" }}>
          {t("opportunitiesTitle", { defaultValue: "Oportunidades" })}
        </h2>
        <div className="divider" />
        <p className="subtitle" style={{ marginTop: "0.35rem" }}>
          {t("opportunitiesSubtitle", {
            defaultValue: "Editais, bolsas e programas abertos para você participar.",
          })}
        </p>
      </div>
      <div className="grid two" style={{ marginTop: "0.75rem", gap: "1.25rem" }}>
        {opportunities.map((opp) => (
          <div key={opp.id} className="opportunity-card" style={{ display: "grid", gap: "0.75rem" }}>
            {opp.image_url && (
              <img
                src={opp.image_url}
                alt={opp.title}
                style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 12 }}
              />
            )}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>{opp.title}</h3>
              <span className="pill">
                {opp.deadline
                  ? t("deadlineLabel", { defaultValue: "Prazo {{date}}", date: opp.deadline })
                  : t("deadlineTbd", { defaultValue: "Prazo a definir" })}
              </span>
            </div>
            <p style={{ margin: 0, color: "var(--muted)" }}>
              {opp.description || t("soon", { defaultValue: "Mais detalhes em breve." })}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", color: "var(--muted)", flexWrap: "wrap" }}>
              {opp.institution && <span>{opp.institution}</span>}
              {opp.category && <span>| {opp.category}</span>}
            </div>
            {opp.video_url && getYoutubeEmbedUrl(opp.video_url) && (
              <div
                style={{
                  position: "relative",
                  paddingBottom: "56.25%",
                  height: 0,
                  overflow: "hidden",
                  borderRadius: 12,
                }}
              >
                <iframe
                  src={getYoutubeEmbedUrl(opp.video_url) || undefined}
                  title={`Vídeo ${opp.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                />
              </div>
            )}
            <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
              <a
                className="btn btn-gold"
                href={opp.official_link || "#"}
                target="_blank"
                rel="noreferrer"
                style={{ pointerEvents: opp.official_link ? "auto" : "none", opacity: opp.official_link ? 1 : 0.6 }}
              >
                {t("applyNow", { defaultValue: "Inscreva-se" })}
              </a>
              <a className="btn btn-ghost" href="/contato">
                {t("common.contact")}
              </a>
            </div>
          </div>
        ))}
        {!opportunities.length && (
          <div className="opportunity-card">
            <p style={{ margin: 0 }}>{t("noOpportunities", { defaultValue: "Nenhuma oportunidade aberta no momento." })}</p>
          </div>
        )}
      </div>
    </div>
  );
};
