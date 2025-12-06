import { FormEvent, useEffect, useState } from "react";

import { ImagePlaceholder } from "../../components/media/ImagePlaceholder";
import { MediaButton } from "../../components/media/MediaButton";
import { api } from "../../services/api";

type Opportunity = {
  id: number;
  title: string;
  status: string;
  deadline?: string;
  category?: string;
  institution?: string;
  description?: string;
  official_link?: string;
  image_url?: string;
  video_url?: string;
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
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchOpportunities = async () => {
    const { data } = await api.get("/opportunities");
    setOpportunities(data.items || data);
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      title,
      description,
      institution,
      category,
      status,
      deadline,
      official_link: officialLink,
      image_url: imageUrl || null,
      video_url: videoUrl || null,
    };

    if (editingId) {
      await api.put(`/opportunities/${editingId}`, payload);
    } else {
      await api.post("/opportunities", payload);
    }
    setTitle("");
    setDescription("");
    setInstitution("");
    setCategory("");
    setStatus("draft");
    setDeadline("");
    setOfficialLink("");
    setImageUrl("");
    setVideoUrl("");
    setEditingId(null);
    fetchOpportunities();
  };

  const handleEdit = (item: Opportunity) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setInstitution(item.institution || "");
    setCategory(item.category || "");
    setStatus(item.status || "draft");
    setDeadline(item.deadline || "");
    setOfficialLink(item.official_link || "");
    setImageUrl(item.image_url || "");
    setVideoUrl(item.video_url || "");
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/opportunities/${id}`);
    if (editingId === id) {
      setEditingId(null);
    }
    fetchOpportunities();
  };

  return (
    <div className="grid two" style={{ alignItems: "start", gap: "1.25rem" }}>
      <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            paddingBottom: "0.5rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <p style={{ margin: 0, color: "var(--muted)" }}>Oportunidades</p>
            <h3 style={{ margin: "0.2rem 0 0" }}>Gerencie bolsas e editais</h3>
          </div>
          <button className="btn btn-ghost" onClick={fetchOpportunities}>
            Atualizar
          </button>
        </div>
        <table style={{ width: "100%", marginTop: "0.5rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--muted)" }}>
              <th>Título</th>
              <th>Status</th>
              <th>Prazo</th>
              <th>Categoria</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((item) => (
              <tr key={item.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "0.65rem 0" }}>{item.title}</td>
                <td style={{ padding: "0.65rem 0", textTransform: "capitalize" }}>{item.status}</td>
                <td style={{ padding: "0.65rem 0" }}>{item.deadline || "—"}</td>
                <td style={{ padding: "0.65rem 0" }}>{item.category || "—"}</td>
                <td style={{ padding: "0.65rem 0", display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-ghost" type="button" onClick={() => handleEdit(item)}>
                    Editar
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={() => handleDelete(item.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="card" onSubmit={handleCreate} style={{ display: "grid", gap: "0.75rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            paddingBottom: "0.5rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h3 style={{ margin: 0 }}>{editingId ? "Editar oportunidade" : "Nova oportunidade"}</h3>
        </div>
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
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <label style={{ fontWeight: 600 }}>Imagem da oportunidade</label>
          <ImagePlaceholder url={imageUrl} label="Nenhuma imagem" maxHeight={180} />
          <MediaButton value={imageUrl} onChange={setImageUrl} label="Upload imagem" />
          <input
            placeholder="ou cole a URL da imagem"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
        </div>
        <div style={{ display: "grid", gap: "0.35rem" }}>
          <label style={{ fontWeight: 600 }}>Vídeo (YouTube, opcional)</label>
          <input
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
          <small style={{ color: "var(--muted)" }}>Somente links do YouTube.</small>
        </div>
        <button className="btn btn-primary" type="submit">
          Salvar
        </button>
      </form>
    </div>
  );
};
