import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { api } from "../../services/api";

export const LeadForm = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.post("/leads", {
        name,
        email,
        phone,
        interest,
        message,
        source: "site",
      });
      setStatus(t("leadForm.success", { defaultValue: "Recebemos seu contato! Em breve retornaremos." }));
      setName("");
      setEmail("");
      setPhone("");
      setInterest("");
      setMessage("");
    } catch (error) {
      setStatus(t("leadForm.error", { defaultValue: "Não foi possível enviar agora. Tente novamente." }));
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
      <h3 style={{ margin: 0 }}>{t("leadForm.title", { defaultValue: "Fale com a ABRAMS" })}</h3>
      <input
        required
        placeholder={t("leadForm.name", { defaultValue: "Nome completo" })}
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
      />
      <input
        required
        type="email"
        placeholder={t("leadForm.email", { defaultValue: "E-mail" })}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
      />
      <input
        placeholder={t("leadForm.phone", { defaultValue: "Telefone" })}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
      />
      <input
        placeholder={t("leadForm.interest", { defaultValue: "Interesse (ex: bolsa, projeto, parceria)" })}
        value={interest}
        onChange={(e) => setInterest(e.target.value)}
        style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
      />
      <textarea
        placeholder={t("leadForm.message", { defaultValue: "Como podemos ajudar?" })}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
      />
      <button className="btn btn-primary" type="submit">
        {t("leadForm.submit", { defaultValue: "Enviar" })}
      </button>
      {status && <small style={{ color: "#0f172a" }}>{status}</small>}
    </form>
  );
};
