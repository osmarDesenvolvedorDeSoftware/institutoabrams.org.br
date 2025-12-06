import { useEffect, useState } from "react";

import { RichTextEditor } from "../../components/editor/RichTextEditor";
import { ImagePlaceholder } from "../../components/media/ImagePlaceholder";
import { MediaButton } from "../../components/media/MediaButton";
import { api } from "../../services/api";

const languages = ["pt", "en", "es", "fr"] as const;
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

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "pagina";

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
  const [activeLang, setActiveLang] = useState<(typeof languages)[number]>("pt");
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const fetchPages = async () => {
    const { data } = await api.get("/pages", { params: { per_page: 100 } });
    setPages(data.items || data);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (!editingId && titles.pt && !slug) {
      setSlug(slugify(titles.pt));
    }
  }, [titles.pt, slug, editingId]);

  const handleSubmit = async () => {
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
    const hasConflict =
      isSingleCategory &&
      pages.some((p) => p.category === category && (!editingId || p.id !== editingId));

    if (hasConflict) {
      setMessage("Já existe uma página para essa categoria. Edite a existente em vez de criar outra.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/pages/${editingId}`, payload);
      } else {
        await api.post("/pages", payload);
      }
      setMessage("Página salva com sucesso");
      resetForm();
      fetchPages();
    } catch (error) {
      setMessage("Erro ao salvar página");
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

  const handleEdit = (page: Page) => {
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

  const handleDelete = async (id: number) => {
    await api.delete(`/pages/${id}`);
    fetchPages();
  };

  const langButton = (lang: (typeof languages)[number]) => {
    const missing = !titles[lang];
    return (
      <button
        key={lang}
        type="button"
        onClick={() => setActiveLang(lang)}
        className="btn btn-ghost"
        style={{
          borderColor: activeLang === lang ? "var(--primary)" : "var(--border)",
          color: activeLang === lang ? "var(--primary-dark)" : "var(--text)",
          position: "relative",
        }}
      >
        {lang.toUpperCase()}
        {missing && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--primary)",
            }}
          />
        )}
      </button>
    );
  };

  return (
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
            <p style={{ margin: 0, color: "var(--muted)" }}>Conteúdo</p>
            <h3 style={{ margin: "0.2rem 0 0" }}>{editingId ? "Editar página" : "Nova página"}</h3>
          </div>
        </div>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          <input
            placeholder="Slug (ex: sobre-nos)"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            disabled={Boolean(editingId)}
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

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {languages.map((lang) => langButton(lang))}
        </div>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          <input
            placeholder={`Título (${activeLang})`}
            value={titles[activeLang] || ""}
            onChange={(e) => setTitles({ ...titles, [activeLang]: e.target.value })}
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <small>Conteúdo ({activeLang})</small>
            <div className="editor-shell">
              <RichTextEditor
                value={contents[activeLang] || ""}
                onChange={(value) => setContents({ ...contents, [activeLang]: value })}
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
            <p style={{ margin: 0, color: "var(--muted)", fontWeight: 600 }}>Galeria (até 5 imagens)</p>
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
                label="Adicionar imagem à galeria"
                onChange={(url) => setGalleryUrls([...galleryUrls, url])}
              />
            )}
          </div>
        )}

        {category === "projeto" && (
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <label style={{ fontWeight: 600 }}>Vídeo (YouTube)</label>
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
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editingId ? "Atualizar" : "Salvar"}
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
            <p style={{ margin: 0, color: "var(--muted)" }}>Páginas</p>
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
              <th>Título (pt)</th>
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
                <td style={{ padding: "0.65rem 0" }}>{page.category || "—"}</td>
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
