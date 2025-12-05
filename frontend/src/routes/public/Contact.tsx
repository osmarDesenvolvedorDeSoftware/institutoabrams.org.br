import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { LeadForm } from "../../components/forms/LeadForm";
import { api } from "../../services/api";
import { getLocalized } from "../../utils/content";

type Page = {
  title_translations: Record<string, string>;
  content_translations: Record<string, string>;
};

export const Contact = () => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState<Page | null>(null);

  useEffect(() => {
    api
      .get("/pages/slug/contato")
      .then(({ data }) => setPage(data))
      .catch(() => setPage(null));
  }, []);

  const title = page ? getLocalized(page.title_translations, i18n.language) : t("contactTitle");
  const content = page ? getLocalized(page.content_translations, i18n.language) : "";

  return (
    <div
      className="container section"
      style={{
        display: "grid",
        gap: "1.75rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      }}
    >
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
            <div style={{ color: "var(--muted)" }} dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <>
              <span>Email: contato@institutoabrams.org.br</span>
              <span>Parcerias: partners@institutoabrams.org.br</span>
              <span>{t("contactAddress", { defaultValue: "Brasília, DF" })}</span>
            </>
          )}
        </div>
      </div>
      <LeadForm />
    </div>
  );
};
