import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { api } from "../../services/api";
import { getLocalized } from "../../utils/content";
import { SeoHelmet } from "../../components/seo/SeoHelmet";
import { RichContent } from "../../components/media/RichContent";
import { DEFAULT_DESCRIPTION } from "../../utils/seoDefaults";

type Page = {
  title_translations: Record<string, string>;
  content_translations: Record<string, string>;
};

export const Contact = () => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState<Page | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/pages/slug/contato");
        setPage(data);
        return;
      } catch {
        // fallback
      }
      try {
        const { data } = await api.get("/pages", { params: { category: "contato", is_published: true, per_page: 1 } });
        const items = data.items || data;
        setPage(items?.[0] || null);
      } catch {
        setPage(null);
      }
    };

    load();
  }, []);

  const title = page ? getLocalized(page.title_translations, i18n.language) : t("contactTitle");
  const content = page ? getLocalized(page.content_translations, i18n.language) : "";
  const description = content ? content.replace(/<[^>]+>/g, "").slice(0, 180) : DEFAULT_DESCRIPTION;

  return (
    <div
      className="container section"
      style={{
        display: "grid",
        gap: "1.75rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      }}
    >
      <SeoHelmet title={title || t("contactTitle", { defaultValue: "Contato" })} description={description} url="/contato" />
      <div>
        <h2 style={{ marginTop: 0, marginBottom: "0.35rem" }}>
          {title || t("contactTitle", { defaultValue: "Contato" })}
        </h2>
        <div className="divider" />
        <p className="subtitle">
          {t("contactSubtitle", {
            defaultValue: "Conte suas ideias, projetos ou dúvidas. Estamos aqui para colaborar.",
          })}
        </p>
        <div
          className="card"
          style={{ display: "grid", gap: "0.65rem", background: "#fff", padding: "1.35rem", borderRadius: 14 }}
        >
          <strong>{t("contactChannels", { defaultValue: "Canais" })}</strong>
          {content ? (
            <RichContent style={{ color: "var(--muted)" }} html={content} />
          ) : (
            <>
              <span>{t("contactEmailLabel", { defaultValue: "E-mail" })}: contato@institutoabrams.org.br</span>
              <span>{t("contactPartnershipLabel", { defaultValue: "Parcerias" })}: partners@institutoabrams.org.br</span>
              <span>{t("contactAddress", { defaultValue: "Brasília, DF" })}</span>
            </>
          )}
        </div>
      </div>
      <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
        <h3 style={{ margin: 0 }}>{t("common.contact", { defaultValue: "Contato" })}</h3>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          {t("contactSubtitle", {
            defaultValue: "Envie um e-mail ou fale conosco pelos canais oficiais.",
          })}
        </p>
        <div style={{ display: "grid", gap: "0.25rem" }}>
          <span>{t("contactEmailLabel", { defaultValue: "E-mail" })}: contato@institutoabrams.org.br</span>
          <span>{t("contactPartnershipLabel", { defaultValue: "Parcerias" })}: partners@institutoabrams.org.br</span>
          <span>{t("contactAddress", { defaultValue: "Brasília, DF" })}</span>
        </div>
      </div>
    </div>
  );
};
