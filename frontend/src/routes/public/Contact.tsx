import { useTranslation } from "react-i18next";

import { LeadForm } from "../../components/forms/LeadForm";

export const Contact = () => {
  const { t } = useTranslation();
  return (
    <div
      className="container section"
      style={{
        display: "grid",
        gap: "1.5rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      }}
    >
      <div>
        <h2 style={{ marginTop: 0 }}>{t("contactTitle", { defaultValue: "Contato" })}</h2>
        <div className="divider" />
        <p className="subtitle">
          {t("contactSubtitle", {
            defaultValue: "Conte suas ideias, projetos ou dúvidas. Estamos aqui para colaborar.",
          })}
        </p>
        <div className="card" style={{ display: "grid", gap: "0.5rem" }}>
          <strong>{t("contactChannels", { defaultValue: "Canais" })}</strong>
          <span>Email: contato@institutoabrams.org.br</span>
          <span>Parcerias: partners@institutoabrams.org.br</span>
          <span>{t("contactAddress", { defaultValue: "Brasília, DF" })}</span>
        </div>
      </div>
      <LeadForm />
    </div>
  );
};
