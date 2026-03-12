import { useEffect, useRef, useState } from "react";

import { RichTextEditor } from "../../components/editor/RichTextEditor";
import { FieldWithHelp } from "../../components/forms/FieldWithHelp";
import { ImagePlaceholder } from "../../components/media/ImagePlaceholder";
import { MediaButton } from "../../components/media/MediaButton";
import { TemplateSelector } from "../../components/templates/TemplateSelector";
import { normalizeRichTextHtml } from "../../utils/html";
import { ContentWizard } from "./components/ContentWizard";
import { api } from "../../services/api";

const languages = ["pt"] as const;
const singlePageCategories = ["contato", "institucional"] as const;

const MESSAGE_PREFIX_SUCCESS = "Sucesso:";
const MESSAGE_PREFIX_ERROR = "Erro:";
const MESSAGE_PREFIX_WARNING = "Aviso:";

type Mode = "list" | "create" | "edit";
type Tab = "content" | "media" | "settings";

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

type Template = {
  id: string;
  name: string;
  description: string;
  category: string | null;
  icon?: string;
  content: string;
};

export const ContentEditor = () => {
  const [mode, setMode] = useState<Mode>("list");
  const [activeTab, setActiveTab] = useState<Tab>("content");
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const visiblePages = pages.filter((page) => page.slug !== "home-content");

  const fetchPages = async () => {
    const { data } = await api.get("/pages", { params: { per_page: 100 } });
    setPages(data.items || data);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const stripMessagePrefix = (text: string) => {
    if (text.startsWith(MESSAGE_PREFIX_SUCCESS)) {
      return text.slice(MESSAGE_PREFIX_SUCCESS.length).trimStart();
    }
    if (text.startsWith(MESSAGE_PREFIX_WARNING)) {
      return text.slice(MESSAGE_PREFIX_WARNING.length).trimStart();
    }
    if (text.startsWith(MESSAGE_PREFIX_ERROR)) {
      return text.slice(MESSAGE_PREFIX_ERROR.length).trimStart();
    }
    return text;
  };

  const messageVariant = message?.startsWith(MESSAGE_PREFIX_SUCCESS)
    ? "success"
    : message?.startsWith(MESSAGE_PREFIX_WARNING)
      ? "warning"
      : "error";
  const messageIcon = messageVariant === "success" ? "Sucesso" : messageVariant === "warning" ? "Aviso" : "Erro";
  const messageText = message ? stripMessagePrefix(message) : "";

  const resetForm = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    setMode("list");
    setActiveTab("content");
    setEditingId(null);
    setSlug("");
    setTitles(languages.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {}));
    setContents(languages.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {}));
    setIsPublished(true);
    setCategory(undefined);
    setHeroImageUrl("");
    setGalleryUrls([]);
    setVideoUrl("");
    setMessage(null);
    setErrors({});
    setHasUnsavedChanges(false);
    setSelectedTemplateId(undefined);
    setLastSaved(null);
    setAutoSaving(false);
  };

  const handleNewPage = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    setMode("create");
    setActiveTab("content");
    setEditingId(null);
    setSlug("");
    setTitles(languages.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {}));
    setContents(languages.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {}));
    setIsPublished(true);
    setCategory(undefined);
    setHeroImageUrl("");
    setGalleryUrls([]);
    setVideoUrl("");
    setMessage(null);
    setErrors({});
    setHasUnsavedChanges(false);
    setSelectedTemplateId(undefined);
    setLastSaved(null);
    setAutoSaving(false);
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplateId(template.id);
    if (template.content) {
      setContents({ pt: template.content });
    }
    if (template.category) {
      setCategory(template.category);
    }
    setHasUnsavedChanges(true);
    setMessage(`${MESSAGE_PREFIX_SUCCESS} Template "${template.name}" aplicado! Personalize o conteúdo conforme necessário.`);
    setTimeout(() => setMessage(null), 5000);
  };

  const applyPageToForm = (page: Page) => {
    setEditingId(page.id);
    setSlug(page.slug);
    setTitles({ ...languages.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {}), ...page.title_translations });
    setContents({
      ...languages.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {}),
      ...Object.fromEntries(
        Object.entries(page.content_translations || {}).map(([lang, value]) => [lang, normalizeRichTextHtml(value)]),
      ),
    });
    setIsPublished(page.is_published);
    setCategory(page.category || undefined);
    setHeroImageUrl(page.hero_image_url || "");
    setGalleryUrls(page.gallery_urls || []);
    setVideoUrl(page.video_url || "");
  };

  const handleEdit = async (page: Page) => {
    setMode("edit");
    setActiveTab("content");
    setMessage(null);
    setErrors({});
    setHasUnsavedChanges(false);
    setSelectedTemplateId(undefined);
    setLastSaved(null);
    setAutoSaving(false);
    try {
      const { data } = await api.get(`/pages/${page.id}`);
      applyPageToForm(data as Page);
    } catch (error) {
      applyPageToForm(page);
      setMessage(`${MESSAGE_PREFIX_ERROR} Não foi possível carregar o conteúdo da página.`);
    }
  };

  const handleDuplicate = async (page: Page) => {
    try {
      const { data } = await api.get(`/pages/${page.id}`);
      setMode("create");
      setActiveTab("content");
      setEditingId(null);
      setSelectedTemplateId(undefined);
      const baseTitle = data.title_translations?.pt || "Cópia";
      const baseSlug = data.slug || "pagina";
      const duplicateSlug = cleanSlugInput(`${baseSlug}-copia-${Date.now()}`);
      setTitles({ pt: `${baseTitle} (Cópia)` });
      setSlug(duplicateSlug);
      setContents({ pt: normalizeRichTextHtml(data.content_translations?.pt || "") });
      setCategory(data.category || undefined);
      setIsPublished(false);
      setHeroImageUrl(data.hero_image_url || "");
      setGalleryUrls(data.gallery_urls || []);
      setVideoUrl(data.video_url || "");
      setHasUnsavedChanges(true);
      setLastSaved(null);
      setAutoSaving(false);
      setMessage(`${MESSAGE_PREFIX_SUCCESS} Página duplicada! Edite o título e slug antes de salvar.`);
    } catch (error) {
      setMessage(`${MESSAGE_PREFIX_ERROR} Erro ao duplicar página.`);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/pages/${id}`);
      setMessage(`${MESSAGE_PREFIX_SUCCESS} Página excluída com sucesso!`);
      fetchPages();
    } catch (error) {
      setMessage(`${MESSAGE_PREFIX_ERROR} Erro ao excluir página. Tente novamente.`);
    }
  };

  const handleCancel = () => {
    if (!hasUnsavedChanges) {
      resetForm();
      return;
    }

    const confirmed = window.confirm(
      "Voc? tem altera?es não salvas. Deseja realmente sair sem salvar?",
    );
    if (confirmed) {
      resetForm();
    }
  };

  const clearError = (key: string) => {
    setErrors((prev) => {
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const validateTitle = (value: string): boolean => {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, title: "Título ? obrigatório" }));
      return false;
    }
    if (value.trim().length < 3) {
      setErrors((prev) => ({ ...prev, title: "Título deve ter pelo menos 3 caracteres" }));
      return false;
    }
    if (value.trim().length > 100) {
      setErrors((prev) => ({ ...prev, title: "Título muito longo (máximo 100 caracteres)" }));
      return false;
    }
    clearError("title");
    return true;
  };

  const validateSlug = (value: string): boolean => {
    if (mode !== "create") {
      return true;
    }
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, slug: "Endereço ? obrigatório" }));
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(value)) {
      setErrors((prev) => ({ ...prev, slug: "Use apenas letras minúsculas, números e hífens" }));
      return false;
    }
    if (value.length < 3) {
      setErrors((prev) => ({ ...prev, slug: "Endereço deve ter pelo menos 3 caracteres" }));
      return false;
    }
    clearError("slug");
    return true;
  };

  const validateContent = (value: string): boolean => {
    const plainText = value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
    if (!plainText) {
      setErrors((prev) => ({ ...prev, content: "Conteúdo ? obrigatório" }));
      return false;
    }
    clearError("content");
    return true;
  };

  const cleanSlugInput = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "agora mesmo";
    if (seconds < 120) return "há 1 minuto";
    if (seconds < 3600) return `há ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 7200) return "há 1 hora";
    return `há ${Math.floor(seconds / 3600)} horas`;
  };

  const autoSave = async () => {
    if (mode === "list" || !hasUnsavedChanges || !titles.pt?.trim()) {
      return;
    }

    setAutoSaving(true);

    const draftSlug = slug.trim() || `rascunho-${Date.now()}`;
    const payload = {
      title_translations: titles,
      content_translations: Object.fromEntries(
        Object.entries(contents).map(([lang, value]) => [lang, normalizeRichTextHtml(value)]),
      ),
      slug: draftSlug,
      is_published: false,
      category: category || null,
      hero_image_url: heroImageUrl || null,
      gallery_urls: galleryUrls.length ? galleryUrls : null,
      video_url: videoUrl || null,
    };

    try {
      if (mode === "create") {
        const { data } = await api.post("/pages", payload);
        setEditingId(data?.id || data?.page?.id || null);
        setMode("edit");
        setSlug(data?.slug || draftSlug);
      } else if (mode === "edit" && editingId) {
        await api.put(`/pages/${editingId}`, payload);
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Erro no auto-save:", error);
    } finally {
      setAutoSaving(false);
    }
  };

  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    if (hasUnsavedChanges && mode !== "list") {
      autoSaveTimerRef.current = setTimeout(() => {
        autoSave();
      }, 30000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, mode, titles, contents, slug, category, heroImageUrl, galleryUrls, videoUrl]);

  const handleSubmit = async () => {
    const isTitleValid = validateTitle(titles.pt || "");
    const isSlugValid = validateSlug(slug);
    const isContentValid = validateContent(contents.pt || "");

    if (!isTitleValid || !isSlugValid || !isContentValid) {
      setMessage(`${MESSAGE_PREFIX_ERROR} Por favor, corrija os erros antes de salvar.`);
      setActiveTab("content");
      return;
    }

    const payload = {
      title_translations: titles,
      content_translations: Object.fromEntries(
        Object.entries(contents).map(([lang, value]) => [lang, normalizeRichTextHtml(value)]),
      ),
      slug: slug.trim(),
      is_published: isPublished,
      category: category || null,
      hero_image_url: heroImageUrl || null,
      gallery_urls: galleryUrls.length ? galleryUrls : null,
      video_url: videoUrl || null,
    };

    const isSingleCategory = category && (singlePageCategories as readonly string[]).includes(category);
    const hasConflict = isSingleCategory && pages.some((p) => p.category === category && p.id !== editingId);

    if (hasConflict) {
      setMessage(`${MESSAGE_PREFIX_ERROR} J? existe uma página para essa categoria. Edite a existente.`);
      return;
    }

    try {
      if (mode === "create") {
        await api.post("/pages", payload);
        setMessage(`${MESSAGE_PREFIX_SUCCESS} Página criada com sucesso!`);
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        fetchPages();
        setTimeout(() => resetForm(), 2000);
      } else if (mode === "edit" && editingId) {
        await api.put(`/pages/${editingId}`, payload);
        setMessage(`${MESSAGE_PREFIX_SUCCESS} Página atualizada com sucesso!`);
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        fetchPages();
        setTimeout(() => resetForm(), 2000);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Erro desconhecido";
      setMessage(`${MESSAGE_PREFIX_ERROR} Erro ao salvar: ${errorMsg}`);
    }
  };

  if (mode === "list") {
    return (
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
            <h3 style={{ margin: 0 }}>Páginas do Site</h3>
            <p style={{ margin: "0.25rem 0 0", color: "var(--muted)" }}>
              Gerencie o conteúdo do seu site institucional
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setWizardOpen(true)}>
            Nova Página
          </button>
        </div>

        {message && (
          <div
            style={{
              padding: "0.85rem 1.25rem",
              borderRadius: 8,
              background:
                messageVariant === "success"
                  ? "var(--success-bg, #dcfce7)"
                  : messageVariant === "warning"
                    ? "var(--warning-bg, #fef3c7)"
                    : "var(--error-bg, #fee2e2)",
              color:
                messageVariant === "success"
                  ? "var(--success, #16a34a)"
                  : messageVariant === "warning"
                    ? "var(--warning, #d97706)"
                    : "var(--error, #dc2626)",
              border: `1px solid ${
                messageVariant === "success"
                  ? "var(--success, #16a34a)"
                  : messageVariant === "warning"
                    ? "var(--warning, #d97706)"
                    : "var(--error, #dc2626)"
              }`,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ fontSize: "1.2em" }}>{messageIcon}</span>
            <span>{messageText}</span>
          </div>
        )}

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
            {visiblePages.map((page) => (
              <tr key={page.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "0.65rem 0" }}>{page.slug}</td>
                <td style={{ padding: "0.65rem 0" }}>
                  {page.title_translations?.pt || <span style={{ color: "tomato" }}>Sem PT</span>}
                </td>
                <td style={{ padding: "0.65rem 0" }}>{page.category || "-"}</td>
                <td style={{ padding: "0.65rem 0" }}>
                  {page.is_published ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        background: "var(--success, #22c55e)",
                        color: "white",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "6px",
                        fontSize: "0.85em",
                        fontWeight: 600,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <span>{MESSAGE_PREFIX_SUCCESS}</span>
                      <span>Publicado</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        background: "var(--warning, #f59e0b)",
                        color: "white",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "6px",
                        fontSize: "0.85em",
                        fontWeight: 600,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <span>Rascunho</span>
                    </span>
                  )}
                </td>
                <td style={{ padding: "0.65rem 0", display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-ghost" onClick={() => handleEdit(page)} title="Editar página">
                    Editar
                  </button>
                  <a
                    href={`/pages/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                    style={{
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                    title="Visualizar página em nova aba"
                  >
                    <span>Ver</span>
                  </a>
                  <button className="btn btn-ghost" onClick={() => handleDuplicate(page)} title="Duplicar página">
                    Duplicar
                  </button>
                  <button className="btn btn-ghost" onClick={() => handleDelete(page.id)} title="Excluir página">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <ContentWizard
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onSuccess={() => {
            setWizardOpen(false);
            fetchPages();
          }}
          onSelectSingle={() => {
            setWizardOpen(false);
            handleNewPage();
          }}
        />
      </div>
    );
  }

  return (
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
          <h3 style={{ margin: 0 }}>{mode === "create" ? "Nova Página" : "Editar Página"}</h3>
          <p style={{ margin: "0.25rem 0 0", color: "var(--muted)" }}>
            {mode === "create"
              ? "Preencha os campos abaixo para criar uma nova página"
              : "Atualize o conteúdo da página"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {autoSaving ? (
            <span
              style={{
                color: "var(--info, #0284c7)",
                fontSize: "0.85em",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <span className="spinner" />
              <span>Salvando...</span>
            </span>
          ) : lastSaved ? (
            <span
              style={{
                color: "var(--success, #16a34a)",
                fontSize: "0.85em",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <span>Salvo {formatTimeAgo(lastSaved)}</span>
            </span>
          ) : hasUnsavedChanges ? (
            <span
              style={{
                color: "var(--warning, #d97706)",
                fontSize: "0.85em",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <span>Não salvo</span>
            </span>
          ) : null}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "2px solid var(--border)",
          marginBottom: "1rem",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          style={{
            padding: "0.75rem 1.5rem",
            background: activeTab === "content" ? "var(--primary)" : "transparent",
            color: activeTab === "content" ? "white" : "var(--text)",
            border: "none",
            borderBottom: activeTab === "content" ? "3px solid var(--primary)" : "none",
            cursor: "pointer",
            fontWeight: 600,
            borderRadius: "6px 6px 0 0",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>Conteúdo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("media")}
          style={{
            padding: "0.75rem 1.5rem",
            background: activeTab === "media" ? "var(--primary)" : "transparent",
            color: activeTab === "media" ? "white" : "var(--text)",
            border: "none",
            borderBottom: activeTab === "media" ? "3px solid var(--primary)" : "none",
            cursor: "pointer",
            fontWeight: 600,
            borderRadius: "6px 6px 0 0",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>Mídia</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          style={{
            padding: "0.75rem 1.5rem",
            background: activeTab === "settings" ? "var(--primary)" : "transparent",
            color: activeTab === "settings" ? "white" : "var(--text)",
            border: "none",
            borderBottom: activeTab === "settings" ? "3px solid var(--primary)" : "none",
            cursor: "pointer",
            fontWeight: 600,
            borderRadius: "6px 6px 0 0",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>Configurações</span>
        </button>
      </div>

      {activeTab === "content" && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {mode === "create" && (
            <>
              <TemplateSelector onSelect={handleTemplateSelect} selectedId={selectedTemplateId} />
              <div style={{ height: "1px", background: "var(--border)", margin: "0.5rem 0" }} />
            </>
          )}
          <FieldWithHelp
            label="Título da Página"
            helpText="Nome que aparecerá no topo da página e nos menus. Exemplo: 'Quem Somos', 'Contato'"
            required
            error={errors.title}
          >
            <input
              placeholder="Digite o título da página"
              value={titles.pt || ""}
              onChange={(e) => {
                setTitles({ ...titles, pt: e.target.value });
                validateTitle(e.target.value);
                setHasUnsavedChanges(true);
              }}
              onBlur={(e) => validateTitle(e.target.value)}
              style={{
                padding: "0.85rem 1rem",
                borderRadius: 10,
                border: `2px solid ${errors.title ? "var(--error, red)" : "var(--border)"}`,
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
            />
          </FieldWithHelp>

          <FieldWithHelp
            label="Endereço da Página (slug)"
            helpText={
              mode === "create"
                ? "URL amigável da página. Use apenas letras minúsculas, números e hífens. Exemplo: 'quem-somos'"
                : "URL da página (não pode ser alterado após criação para preservar links externos)"
            }
            required={mode === "create"}
            error={errors.slug}
          >
            <input
              placeholder={mode === "create" ? "quem-somos" : "gerado-na-criacao"}
              value={slug}
              onChange={(e) => {
                const cleanSlug = cleanSlugInput(e.target.value);
                setSlug(cleanSlug);
                validateSlug(cleanSlug);
                setHasUnsavedChanges(true);
              }}
              onBlur={(e) => validateSlug(e.target.value)}
              disabled={mode === "edit"}
              readOnly={mode === "edit"}
              style={{
                padding: "0.85rem 1rem",
                borderRadius: 10,
                border: `2px solid ${errors.slug ? "var(--error, red)" : "var(--border)"}`,
                background: mode === "edit" ? "var(--disabled-bg, #f5f5f5)" : "white",
                cursor: mode === "edit" ? "not-allowed" : "text",
                fontFamily: "monospace",
                fontSize: "0.9em",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
            />
          </FieldWithHelp>

          <FieldWithHelp
            label="Categoria da Página"
            helpText="Tipo de página: Projeto (trabalhos realizados com galeria), Contato (formulário de contato), Institucional (sobre nós, missão)"
          >
            <select
              value={category || ""}
              onChange={(e) => {
                setCategory(e.target.value || undefined);
                setHasUnsavedChanges(true);
              }}
              style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
            >
              <option value="">Nenhuma (página comum)</option>
              <option value="projeto">Projeto (com galeria e vídeo)</option>
              <option value="contato">Contato (formulário)</option>
              <option value="institucional">Institucional (sobre nós)</option>
            </select>
          </FieldWithHelp>

          <FieldWithHelp
            label="Conteúdo da Página"
            helpText="Texto principal da página. Use a barra de ferramentas para formatar (negrito, itálico, listas, links). Escreva parágrafos curtos para facilitar a leitura."
            required
            error={errors.content}
          >
            <div
              className="editor-shell"
              style={{
                border: `2px solid ${errors.content ? "var(--error, red)" : "var(--border)"}`,
                borderRadius: 10,
                transition: "border-color 0.2s ease",
              }}
            >
              <RichTextEditor
                value={contents.pt || ""}
                onChange={(value) => {
                  setContents({ ...contents, pt: value });
                  validateContent(value);
                  setHasUnsavedChanges(true);
                }}
              />
            </div>
          </FieldWithHelp>
        </div>
      )}

      {activeTab === "media" && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {(category === "projeto" || category === "institucional" || !category) && (
            <>
              <FieldWithHelp
                label="Imagem Principal"
                helpText="Imagem de destaque que aparece no topo da página. Recomendado: 1200x600 pixels, até 200KB para carregar rápido."
              >
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <ImagePlaceholder url={heroImageUrl} label="Nenhuma imagem selecionada" maxHeight={220} />
                  <MediaButton
                    value={heroImageUrl}
                    onChange={(value) => {
                      setHeroImageUrl(value);
                      setHasUnsavedChanges(true);
                    }}
                    label="Fazer Upload"
                  />
                  <input
                    placeholder="ou cole a URL da imagem aqui"
                    value={heroImageUrl}
                    onChange={(e) => {
                      setHeroImageUrl(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
                  />
                </div>
              </FieldWithHelp>

              {!category && (
                <div
                  style={{
                    padding: "1rem",
                    background: "var(--info-bg, #dbeafe)",
                    borderRadius: 8,
                    color: "var(--info, #0284c7)",
                  }}
                >
                  <strong>Dica:</strong> Selecione uma categoria na aba "Conteúdo" para ver mais
                  opções de mídia.
                </div>
              )}
            </>
          )}

          {category === "projeto" && (
            <FieldWithHelp
              label="Galeria de Fotos"
              helpText="Adicione até 5 imagens do projeto. Clique em 'Adicionar imagem' para incluir mais fotos. Recomendado: 800x600 pixels cada."
            >
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <div className="grid two">
                  {galleryUrls.map((url, idx) => (
                    <div key={idx} style={{ display: "grid", gap: "0.35rem" }}>
                      <ImagePlaceholder url={url} maxHeight={140} label={`Foto ${idx + 1}`} />
                      <input
                        placeholder={`URL da foto ${idx + 1}`}
                        value={url}
                        onChange={(e) => {
                          const clone = [...galleryUrls];
                          clone[idx] = e.target.value;
                          setGalleryUrls(clone);
                          setHasUnsavedChanges(true);
                        }}
                        style={{ padding: "0.65rem 0.75rem", borderRadius: 10, border: "1px solid var(--border)" }}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                          setGalleryUrls(galleryUrls.filter((_, i) => i !== idx));
                          setHasUnsavedChanges(true);
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
                {galleryUrls.length < 5 && (
                  <MediaButton
                    label="Adicionar imagem à galeria"
                    onChange={(url) => {
                      setGalleryUrls([...galleryUrls, url]);
                      setHasUnsavedChanges(true);
                    }}
                  />
                )}
              </div>
            </FieldWithHelp>
          )}

          {category === "projeto" && (
            <FieldWithHelp
              label="Vídeo do Projeto (YouTube)"
              helpText="Cole o link completo do vídeo no YouTube. Exemplo: https://www.youtube.com/watch?v=abc123. Apenas vídeos do YouTube são suportados."
            >
              <input
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
              />
            </FieldWithHelp>
          )}

          {category === "contato" && (
            <div
              style={{
                padding: "1rem",
                background: "var(--warning-bg, #fef3c7)",
                borderRadius: 8,
                color: "var(--warning, #d97706)",
              }}
            >
              Páginas de contato não possuem recursos de mídia adicionais.
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div style={{ display: "grid", gap: "1rem" }}>
          <FieldWithHelp
            label="Status da Página"
            helpText="Páginas publicadas ficam visíveis para todos os visitantes do site. Desmarque para manter como rascunho (visível apenas para administradores)."
          >
            <label
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
                padding: "1rem",
                border: "1px solid var(--border)",
                borderRadius: 8,
                cursor: "pointer",
                background: isPublished ? "var(--success-bg, #dcfce7)" : "var(--warning-bg, #fef3c7)",
              }}
            >
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => {
                  setIsPublished(e.target.checked);
                  setHasUnsavedChanges(true);
                }}
                style={{ width: 20, height: 20 }}
              />
              <div>
                <strong style={{ color: isPublished ? "var(--success, #16a34a)" : "var(--warning, #d97706)" }}>
                  {isPublished ? "Publicado" : "Rascunho"}
                </strong>
                <br />
                <small style={{ color: "var(--muted)" }}>
                  {isPublished ? "Página visível para todos" : "Página visível apenas para admins"}
                </small>
              </div>
            </label>
          </FieldWithHelp>

          <div
            style={{
              padding: "1rem",
              background: "var(--card-bg, #f9fafb)",
              borderRadius: 8,
              border: "1px solid var(--border)",
            }}
          >
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.95em" }}>Informações</h4>
            <ul style={{ margin: 0, paddingLeft: "1.5rem", fontSize: "0.9em", color: "var(--muted)" }}>
              <li>Páginas publicadas ficam visíveis para todos os visitantes</li>
              <li>Rascunhos são visíveis apenas para administradores logados</li>
              <li>Voc? pode alternar entre publicado e rascunho a qualquer momento</li>
            </ul>
          </div>

          <div
            style={{
              padding: "1rem",
              background: "var(--info-bg, #dbeafe)",
              borderRadius: 8,
              color: "var(--info, #0284c7)",
            }}
          >
            <strong>Em breve:</strong> Configurações de SEO, meta tags e compartilhamento social.
          </div>
        </div>
      )}

      {message && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: 8,
            background:
              messageVariant === "success"
                ? "var(--success-bg, #dcfce7)"
                : messageVariant === "warning"
                  ? "var(--warning-bg, #fef3c7)"
                  : "var(--error-bg, #fee2e2)",
            color:
              messageVariant === "success"
                ? "var(--success, #16a34a)"
                : messageVariant === "warning"
                  ? "var(--warning, #d97706)"
                  : "var(--error, #dc2626)",
            border: `1px solid ${
              messageVariant === "success"
                ? "var(--success, #16a34a)"
                : messageVariant === "warning"
                  ? "var(--warning, #d97706)"
                  : "var(--error, #dc2626)"
            }`,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "1.2em" }}>{messageIcon}</span>
          <span>{messageText}</span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          paddingTop: "0.5rem",
          borderTop: "1px solid var(--border)",
          alignItems: "center",
        }}
      >
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={Object.keys(errors).length > 0}
          style={{
            opacity: Object.keys(errors).length > 0 ? 0.5 : 1,
            cursor: Object.keys(errors).length > 0 ? "not-allowed" : "pointer",
          }}
        >
          {mode === "create" ? "Criar Página" : "Salvar Alterações"}
        </button>

        {mode === "edit" && (
          <a
            href={`/pages/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: "none" }}
          >
            Visualizar
          </a>
        )}

        <button className="btn btn-ghost" onClick={handleCancel}>
          Voltar para lista
        </button>

        {Object.keys(errors).length > 0 && (
          <span style={{ color: "var(--error, red)", fontSize: "0.9em" }}>Corrija os erros antes de salvar</span>
        )}
      </div>
    </div>
  );
};
