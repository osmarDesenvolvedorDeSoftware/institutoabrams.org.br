import { useEffect, useState } from "react";

import { RichTextEditor } from "../../components/editor/RichTextEditor";
import { ImagePlaceholder } from "../../components/media/ImagePlaceholder";
import { MediaButton } from "../../components/media/MediaButton";
import { api } from "../../services/api";
import { ContentWizard } from "./components/ContentWizard";

const languages = ["pt"] as const;
const singlePageCategories = ["contato", "institucional"] as const;

type Page = {
  id: number;
  slug: string;
  title_translations: Record<string, string>;
  content_translations: Record<string, string>;
  is_published: boolean;
  category?: string | null;
  hero_image_url?: string | null;
  gallery_urls?: string[] | null;
  video_url?: string | null;
};

export const ContentEditor = () => {
  const [titles, setTitles] = useState<Record<string, string>>(
    languages.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {}),
  );
  const [contents, setContents] = useState<Record<string, string>>(
    languages.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {}),
  );
  const [category, setCategory] = useState<string | undefined>();
  const [slug, setSlug] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [wizardOpen, setWizardOpen] = useState(false);

  const fetchPages = async () => {
    const { data } = await api.get("/pages", { params: { per_page: 100 } });
    setPages(data.items || data);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSubmit = async () => {
    if (!editingId) {
      setMessage("Selecione uma pagina para editar.");
      return;
    }

    const slugToSend = slug.trim();
    const payload: Record<string, unknown> = {
      title_translations: titles,
      content_translations: contents,
      is_published: isPublished,
      hero_image_url: heroImageUrl || null,
      gallery_urls: galleryUrls.length ? galleryUrls : null,
      video_url: videoUrl || null,
    };

    if (category) {
      payload.category = category;
    }
    if (slugToSend) {
      payload.slug = slugToSend;
    }

    const isSingleCategory = category && (singlePageCategories as readonly string[]).includes(category);
    const hasConflict = isSingleCategory && pages.some((p) => p.category === category && p.id !== editingId);

    if (hasConflict) {
      setMessage("Ja existe uma pagina para essa categoria. Edite a existente.");
      return;
    }

    try {
      await api.put(`/pages/${editingId}`, payload);
      setMessage("Pagina atualizada com sucesso");
      fetchPages();
    } catch (error) {
      setMessage("Erro ao salvar pagina");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setSlug("");
    setTitles(languages.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {}));
    setContents(languages.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {}));
    setIsPublished(true);
    setCategory(undefined);
    setHeroImageUrl("");
    setGalleryUrls([]);
    setVideoUrl("");
  };

  const applyPageToForm = (page: Page) => {
    setEditingId(page.id);
    setSlug(page.slug);
    setTitles({ ...languages.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {}), ...page.title_translations });
    setContents({ ...languages.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {}), ...page.content_translations });
    setIsPublished(page.is_published);
    setCategory(page.category || undefined);
    setHeroImageUrl((page as any).hero_image_url || "");
    setGalleryUrls((page as any).gallery_urls || []);
    setVideoUrl((page as any).video_url || "");
  };

  const handleEdit = async (page: Page) => {
    setMessage(null);
    try {
      const { data } = await api.get(`/pages/${page.id}`);
      applyPageToForm(data as Page);
    } catch (error) {
      applyPageToForm(page);
      setMessage("Nao foi possivel carregar o conteudo completo.");
    }
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/pages/${id}`);
    fetchPages();
  };

  const activeLang = "pt";

  return (
    <>
      <div className="grid two" style={{ alignItems: "start", gap: "1.25rem" }}>
        <div className="card" style={{ display: "grid", gap: "1rem" }}>
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
            <p style={{ margin: 0, color: "var(--muted)" }}>Conteudo</p>
            <h3 style={{ margin: "0.2rem 0 0" }}>Editar pagina</h3>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-primary" type="button" onClick={() => setWizardOpen(true)}>
              Criar pagina
            </button>
          </div>
        </div>

          <div style={{ display: "grid", gap: "0.75rem" }}>
            <input
              placeholder="Slug (ex: sobre-nos)"
              value={slug}
              readOnly
              disabled
              style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
            />
          <select
            value={category || ""}
            onChange={(e) => setCategory(e.target.value || undefined)}
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          >
            <option value="">Categoria (opcional)</option>
            <option value="projeto">Projeto</option>
            <option value="contato">Contato</option>
            <option value="institucional">Institucional</option>
          </select>
          </div>

          <div style={{ display: "grid", gap: "0.75rem" }}>
            <input
              placeholder="Titulo"
              value={titles.pt || ""}
              onChange={(e) => setTitles({ ...titles, pt: e.target.value })}
              style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
            />
            <div style={{ display: "grid", gap: "0.35rem" }}>
              <small>Conteudo</small>
              <div className="editor-shell">
                <RichTextEditor
                  value={contents.pt || ""}
                  onChange={(value) => setContents({ ...contents, pt: value })}
                />
              </div>
            </div>
          </div>

          {(category === "projeto" || category === "institucional" || category === "quem-somos") && (
            <div style={{ display: "grid", gap: "0.65rem" }}>
              <p style={{ margin: 0, color: "var(--muted)", fontWeight: 600 }}>
                {category === "projeto" ? "Imagem principal do projeto" : "Banner institucional"}
              </p>
              <ImagePlaceholder url={heroImageUrl} label="Nenhuma imagem selecionada" maxHeight={220} />
              <MediaButton value={heroImageUrl} onChange={setHeroImageUrl} label="Upload imagem principal" />
              <input
                placeholder="ou cole a URL da imagem"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
              />
            </div>
          )}

          {category === "projeto" && (
            <div style={{ display: "grid", gap: "0.65rem" }}>
              <p style={{ margin: 0, color: "var(--muted)", fontWeight: 600 }}>Galeria (ate 5 imagens)</p>
              <div className="grid two">
                {galleryUrls.map((url, idx) => (
                  <div key={idx} style={{ display: "grid", gap: "0.35rem" }}>
                    <ImagePlaceholder url={url} maxHeight={140} label="Sem imagem" />
                    <input
                      value={url}
                      onChange={(e) => {
                        const clone = [...galleryUrls];
                        clone[idx] = e.target.value;
                        setGalleryUrls(clone);
                      }}
                      style={{ padding: "0.65rem 0.75rem", borderRadius: 10, border: "1px solid var(--border)" }}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setGalleryUrls(galleryUrls.filter((_, i) => i !== idx))}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
              {galleryUrls.length < 5 && (
                <MediaButton
                  label="Adicionar imagem a galeria"
                  onChange={(url) => setGalleryUrls([...galleryUrls, url])}
                />
              )}
            </div>
          )}

          {category === "projeto" && (
            <div style={{ display: "grid", gap: "0.35rem" }}>
              <label style={{ fontWeight: 600 }}>Video (YouTube)</label>
              <input
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
              />
              <small style={{ color: "var(--muted)" }}>Somente links do YouTube.</small>
            </div>
          )}

          <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            Publicado
          </label>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={!editingId}>
              Atualizar
            </button>
            {editingId && (
              <button className="btn btn-ghost" type="button" onClick={resetForm}>
                Cancelar
              </button>
            )}
            {message && <span style={{ color: "var(--text)" }}>{message}</span>}
          </div>
        </div>

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
              <p style={{ margin: 0, color: "var(--muted)" }}>Paginas</p>
              <h3 style={{ margin: "0.25rem 0" }}>Listagem</h3>
            </div>
            <button className="btn btn-ghost" onClick={fetchPages}>
              Atualizar
            </button>
          </div>
          <table style={{ width: "100%", marginTop: "0.25rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th>Slug</th>
                <th>Titulo (pt)</th>
                <th>Categoria</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.65rem 0" }}>{page.slug}</td>
                  <td style={{ padding: "0.65rem 0" }}>
                    {page.title_translations?.pt || <span style={{ color: "tomato" }}>Sem PT</span>}
                  </td>
                  <td style={{ padding: "0.65rem 0" }}>{page.category || "-"}</td>
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
      <ContentWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={() => {
          setWizardOpen(false);
          fetchPages();
        }}
      />
    </>
  );
};
