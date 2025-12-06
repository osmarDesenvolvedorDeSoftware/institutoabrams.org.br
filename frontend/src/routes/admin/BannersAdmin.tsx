import { FormEvent, useEffect, useState } from "react";

import { ImagePlaceholder } from "../../components/media/ImagePlaceholder";
import { MediaButton } from "../../components/media/MediaButton";
import { api } from "../../services/api";

type Banner = {
  id: number;
  title: string;
  subtitle?: string | null;
  image_url: string;
  link_url?: string | null;
  order?: number;
  is_active?: boolean;
};

export const BannersAdmin = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchBanners = async () => {
    const { data } = await api.get("/banners", { params: { per_page: 50 } });
    setBanners(data.items || data);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSubtitle("");
    setImageUrl("");
    setLinkUrl("");
    setOrder(0);
    setIsActive(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      title,
      subtitle: subtitle || null,
      image_url: imageUrl,
      link_url: linkUrl || null,
      order,
      is_active: isActive,
    };
    if (!imageUrl) {
      alert("Selecione uma imagem para o banner.");
      return;
    }
    if (editingId) {
      await api.put(`/banners/${editingId}`, payload);
    } else {
      await api.post("/banners", payload);
    }
    resetForm();
    fetchBanners();
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || "");
    setImageUrl(banner.image_url);
    setLinkUrl(banner.link_url || "");
    setOrder(banner.order || 0);
    setIsActive(banner.is_active ?? true);
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/banners/${id}`);
    fetchBanners();
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
            <p style={{ margin: 0, color: "var(--muted)" }}>Banners</p>
            <h3 style={{ margin: "0.2rem 0 0" }}>Slider da Home</h3>
          </div>
          <button className="btn btn-ghost" type="button" onClick={fetchBanners}>
            Atualizar
          </button>
        </div>
        <table style={{ width: "100%", marginTop: "0.25rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--muted)" }}>
              <th>Título</th>
              <th>Ordem</th>
              <th>Ativo</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "0.65rem 0" }}>{banner.title}</td>
                <td style={{ padding: "0.65rem 0" }}>{banner.order ?? 0}</td>
                <td style={{ padding: "0.65rem 0" }}>{banner.is_active ? "Sim" : "Não"}</td>
                <td style={{ padding: "0.65rem 0", display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-ghost" onClick={() => handleEdit(banner)}>
                    Editar
                  </button>
                  <button className="btn btn-ghost" onClick={() => handleDelete(banner.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
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
          <h3 style={{ margin: 0 }}>{editingId ? "Editar banner" : "Novo banner"}</h3>
        </div>
        <input
          required
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <input
          placeholder="Subtítulo (opcional)"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <label style={{ fontWeight: 600 }}>Imagem</label>
          <ImagePlaceholder url={imageUrl} label="Nenhuma imagem" maxHeight={200} />
          <MediaButton value={imageUrl} onChange={setImageUrl} label="Upload imagem" />
          <input
            placeholder="ou cole a URL da imagem"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
        </div>
        <input
          placeholder="Link (opcional)"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <input
          type="number"
          placeholder="Ordem"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Ativo
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-primary" type="submit">
            {editingId ? "Atualizar" : "Salvar"}
          </button>
          {editingId && (
            <button className="btn btn-ghost" type="button" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
