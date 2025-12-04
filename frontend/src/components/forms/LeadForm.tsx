import { FormEvent, useState } from "react";

import { api } from "../../services/api";

export const LeadForm = () => {
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
      setStatus("Recebemos seu contato! Em breve retornaremos.");
      setName("");
      setEmail("");
      setPhone("");
      setInterest("");
      setMessage("");
    } catch (error) {
      setStatus("Não foi possível enviar agora. Tente novamente.");
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
      <h3 style={{ margin: 0 }}>Fale com a ABRAMS</h3>
      <input
        required
        placeholder="Nome completo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
      />
      <input
        required
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
      />
      <input
        placeholder="Telefone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
      />
      <input
        placeholder="Interesse (ex: bolsa, projeto, parceria)"
        value={interest}
        onChange={(e) => setInterest(e.target.value)}
        style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
      />
      <textarea
        placeholder="Como podemos ajudar?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
      />
      <button className="btn btn-primary" type="submit">
        Enviar
      </button>
      {status && <small style={{ color: "#0f172a" }}>{status}</small>}
    </form>
  );
};
