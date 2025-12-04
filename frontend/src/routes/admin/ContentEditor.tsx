import { useEffect, useState } from "react";

import { RichTextEditor } from "../../components/editor/RichTextEditor";
import { api } from "../../services/api";

type Page = {
  id: number;
  slug: string;
  title_translations: Record<string, string>;
  content_translations: Record<string, string>;
  is_published: boolean;
};

export const ContentEditor = () => {
  const [titlePt, setTitlePt] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [contentPt, setContentPt] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [slug, setSlug] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchPages = async () => {
    const { data } = await api.get("/pages");
    setPages(data.items || data);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSubmit = async () => {
    const payload = {
      slug,
      title_translations: { pt: titlePt, en: titleEn },
      content_translations: { pt: contentPt, en: contentEn },
      is_published: isPublished,
    };

    try {
      if (editingId) {
        await api.put(`/pages/${editingId}`, payload);
      } else {
        await api.post("/pages", payload);
      }
      setMessage("Página salva com sucesso");
      setEditingId(null);
      setSlug("");
      setTitlePt("");
      setTitleEn("");
      setContentPt("");
      setContentEn("");
      fetchPages();
    } catch (error) {
      setMessage("Erro ao salvar página");
    }
  };

  const handleEdit = (page: Page) => {
    setEditingId(page.id);
    setSlug(page.slug);
    setTitlePt(page.title_translations?.pt || "");
    setTitleEn(page.title_translations?.en || "");
    setContentPt(page.content_translations?.pt || "");
    setContentEn(page.content_translations?.en || "");
    setIsPublished(page.is_published);
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/pages/${id}`);
    fetchPages();
  };

  return (
    <div className="grid two">
      <div className="card" style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <input
            placeholder="Slug (ex: sobre-nos)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
          <input
            placeholder="Título (pt)"
            value={titlePt}
            onChange={(e) => setTitlePt(e.target.value)}
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
          <input
            placeholder="Título (en)"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
        </div>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <small>Conteúdo (pt)</small>
          <RichTextEditor value={contentPt} onChange={setContentPt} />
          <small>Conteúdo (en)</small>
          <RichTextEditor value={contentEn} onChange={setContentEn} />
        </div>
        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Publicado
        </label>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editingId ? "Atualizar" : "Salvar"}
          </button>
          {message && <span style={{ color: "#0f172a" }}>{message}</span>}
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, color: "#94a3b8" }}>Páginas</p>
            <h3 style={{ margin: "0.25rem 0" }}>Listagem</h3>
          </div>
          <button className="btn btn-ghost" onClick={fetchPages}>
            Atualizar
          </button>
        </div>
        <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#94a3b8" }}>
              <th>Slug</th>
              <th>Título (pt)</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "0.65rem 0" }}>{page.slug}</td>
                <td style={{ padding: "0.65rem 0" }}>{page.title_translations?.pt}</td>
                <td style={{ padding: "0.65rem 0" }}>
                  {page.is_published ? "Publicado" : "Rascunho"}
                </td>
                <td style={{ padding: "0.65rem 0", display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-ghost" onClick={() => handleEdit(page)}>
                    Editar
                  </button>
                  <button className="btn btn-ghost" onClick={() => handleDelete(page.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
