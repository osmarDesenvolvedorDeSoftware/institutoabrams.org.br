import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError("Falha no login. Verifique as credenciais.");
    }
  };

  return (
    <div className="container" style={{ padding: "2rem 0", maxWidth: "520px" }}>
      <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
        <h2 style={{ marginTop: 0 }}>Acesso ao painel</h2>
        <input
          required
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <input
          required
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <button type="submit" className="btn btn-primary">
          Entrar
        </button>
        {error && <small style={{ color: "#ef4444" }}>{error}</small>}
      </form>
    </div>
  );
};
