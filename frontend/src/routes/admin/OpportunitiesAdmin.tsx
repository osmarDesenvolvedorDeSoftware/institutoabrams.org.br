import { FormEvent, useEffect, useState } from "react";

import { api } from "../../services/api";

type Opportunity = {
  id: number;
  title: string;
  status: string;
  deadline?: string;
  category?: string;
  institution?: string;
};

export const OpportunitiesAdmin = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [institution, setInstitution] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("draft");
  const [deadline, setDeadline] = useState("");
  const [officialLink, setOfficialLink] = useState("");

  const fetchOpportunities = async () => {
    const { data } = await api.get("/opportunities");
    setOpportunities(data.items || data);
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    await api.post("/opportunities", {
      title,
      description,
      institution,
      category,
      status,
      deadline,
      official_link: officialLink,
    });
    setTitle("");
    setDescription("");
    setInstitution("");
    setCategory("");
    setStatus("draft");
    setDeadline("");
    setOfficialLink("");
    fetchOpportunities();
  };

  return (
    <div className="grid two">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, color: "#94a3b8" }}>Oportunidades</p>
            <h3 style={{ margin: "0.15rem 0" }}>Gerencie bolsas e editais</h3>
          </div>
          <button className="btn btn-ghost" onClick={fetchOpportunities}>
            Atualizar
          </button>
        </div>
        <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#94a3b8" }}>
              <th>Título</th>
              <th>Status</th>
              <th>Prazo</th>
              <th>Categoria</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((item) => (
              <tr key={item.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "0.65rem 0" }}>{item.title}</td>
                <td style={{ padding: "0.65rem 0", textTransform: "capitalize" }}>{item.status}</td>
                <td style={{ padding: "0.65rem 0" }}>{item.deadline || "—"}</td>
                <td style={{ padding: "0.65rem 0" }}>{item.category || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="card" onSubmit={handleCreate} style={{ display: "grid", gap: "0.75rem" }}>
        <h3 style={{ marginTop: 0 }}>Nova oportunidade</h3>
        <input
          required
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <textarea
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <input
          placeholder="Instituição"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <input
          placeholder="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        >
          <option value="draft">Rascunho</option>
          <option value="open">Aberta</option>
          <option value="closed">Encerrada</option>
          <option value="archived">Arquivada</option>
        </select>
        <input
          placeholder="Link oficial"
          value={officialLink}
          onChange={(e) => setOfficialLink(e.target.value)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <button className="btn btn-primary" type="submit">
          Salvar
        </button>
      </form>
    </div>
  );
};
