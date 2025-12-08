import { useEffect, useMemo, useState } from "react";

import { ImagePlaceholder } from "../../components/media/ImagePlaceholder";
import { MediaButton } from "../../components/media/MediaButton";
import { api } from "../../services/api";

type Section =
  | {
      type: "hero";
      title?: string;
      subtitle?: string;
      button_text?: string;
      button_url?: string;
      image_url?: string;
    }
  | {
      type: "text";
      content?: string;
    }
  | {
      type: "image";
      image_url?: string;
      caption?: string;
    }
  | Record<string, any>;

export const HomeEditor = () => {
  const [pageId, setPageId] = useState<number | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const ensureHero = (list: Section[]) => {
    const hasHero = list.some((s) => s.type === "hero");
    if (hasHero) return list;
    return [
      {
        type: "hero",
        title: "",
        subtitle: "",
        button_text: "",
        button_url: "",
        image_url: "",
      },
      ...list,
    ];
  };

  useEffect(() => {
    setLoading(true);
    api
      .get("/pages/slug/home-content")
      .then(({ data }) => {
        setPageId(data.id);
        const loaded = Array.isArray(data.sections) ? data.sections : [];
        setSections(ensureHero(loaded));
      })
      .catch(() => {
        setError("Nao foi possivel carregar o conteudo da home.");
      })
      .finally(() => setLoading(false));
  }, []);

  const moveSection = (index: number, direction: -1 | 1) => {
    setSections((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[target];
      next[target] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const removeSection = (index: number) => {
    setSections((prev) => {
      if (prev.length <= 1) {
        setError("A home precisa ter pelo menos uma section.");
        return prev;
      }
      const next = prev.filter((_, i) => i !== index);
      return ensureHero(next);
    });
  };

  const updateSection = (index: number, patch: Partial<Section>) => {
    setSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const addText = () => {
    setSections((prev) => [...prev, { type: "text", content: "" }]);
  };

  const addImage = () => {
    setSections((prev) => [...prev, { type: "image", image_url: "", caption: "" }]);
  };

  const hero = useMemo(() => sections.find((s) => s.type === "hero") as Section | undefined, [sections]);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!pageId) {
      setError("Pagina home-content nao carregada.");
      return;
    }

    let finalSections = [...sections];
    finalSections = ensureHero(finalSections);

    const heroSection = finalSections.find((s) => s.type === "hero") as any;
    if (heroSection && !heroSection.title) {
      setError("Preencha pelo menos o titulo do hero.");
      return;
    }
    if (!finalSections.length) {
      setError("Adicione ao menos uma section.");
      return;
    }

    setSaving(true);
    try {
      await api.patch(`/pages/${pageId}`, { sections: finalSections });
      setSuccess("Conteudo salvo com sucesso.");
    } catch (err) {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: "1rem" }}>
        Carregando conteudo da home...
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: "1.25rem", display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <h2 style={{ margin: 0 }}>Editar Home</h2>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar alteracoes"}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
        <h3 style={{ margin: 0 }}>Hero</h3>
        <input
          placeholder="Titulo"
          value={(hero as any)?.title || ""}
          onChange={(e) => {
            const idx = sections.findIndex((s) => s.type === "hero");
            if (idx >= 0) updateSection(idx, { title: e.target.value });
          }}
          style={{ padding: "0.75rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <input
          placeholder="Subtitulo"
          value={(hero as any)?.subtitle || ""}
          onChange={(e) => {
            const idx = sections.findIndex((s) => s.type === "hero");
            if (idx >= 0) updateSection(idx, { subtitle: e.target.value });
          }}
          style={{ padding: "0.75rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <input
            placeholder="Texto do botao"
            value={(hero as any)?.button_text || ""}
            onChange={(e) => {
              const idx = sections.findIndex((s) => s.type === "hero");
              if (idx >= 0) updateSection(idx, { button_text: e.target.value });
            }}
            style={{ padding: "0.75rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
          <input
            placeholder="URL do botao"
            value={(hero as any)?.button_url || ""}
            onChange={(e) => {
              const idx = sections.findIndex((s) => s.type === "hero");
              if (idx >= 0) updateSection(idx, { button_url: e.target.value });
            }}
            style={{ padding: "0.75rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
        </div>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <label style={{ fontWeight: 600 }}>Imagem do hero</label>
          <ImagePlaceholder url={(hero as any)?.image_url} label="Nenhuma imagem selecionada" maxHeight={220} />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <MediaButton
              value={(hero as any)?.image_url}
              onChange={(url) => {
                const idx = sections.findIndex((s) => s.type === "hero");
                if (idx >= 0) updateSection(idx, { image_url: url });
              }}
              label="Selecionar imagem"
            />
            {(hero as any)?.image_url ? (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  const idx = sections.findIndex((s) => s.type === "hero");
                  if (idx >= 0) updateSection(idx, { image_url: "" });
                }}
              >
                Remover imagem
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <h3 style={{ margin: 0 }}>Sections</h3>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={addText}>
              + Adicionar Texto
            </button>
            <button className="btn btn-ghost" onClick={addImage}>
              + Adicionar Imagem
            </button>
          </div>
        </div>

        {sections.map((section, index) => {
          if (section.type === "hero") {
            return null;
          }
          if (section.type === "text") {
            return (
              <div key={index} className="card" style={{ padding: "0.75rem", display: "grid", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>Texto</strong>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <button className="btn btn-ghost" onClick={() => moveSection(index, -1)}>
                      ↑
                    </button>
                    <button className="btn btn-ghost" onClick={() => moveSection(index, 1)}>
                      ↓
                    </button>
                    <button className="btn btn-ghost" onClick={() => removeSection(index)}>
                      Remover
                    </button>
                  </div>
                </div>
                <textarea
                  placeholder="Conteudo"
                  value={(section as any).content || ""}
                  onChange={(e) => updateSection(index, { content: e.target.value })}
                  style={{ padding: "0.75rem 1rem", borderRadius: 10, border: "1px solid var(--border)", minHeight: 120 }}
                />
              </div>
            );
          }
          if (section.type === "image") {
            return (
              <div key={index} className="card" style={{ padding: "0.75rem", display: "grid", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>Imagem</strong>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <button className="btn btn-ghost" onClick={() => moveSection(index, -1)}>
                      ↑
                    </button>
                    <button className="btn btn-ghost" onClick={() => moveSection(index, 1)}>
                      ↓
                    </button>
                    <button className="btn btn-ghost" onClick={() => removeSection(index)}>
                      Remover
                    </button>
                  </div>
                </div>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <ImagePlaceholder url={(section as any).image_url} label="Nenhuma imagem selecionada" maxHeight={200} />
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <MediaButton
                      value={(section as any).image_url}
                      onChange={(url) => updateSection(index, { image_url: url })}
                      label="Selecionar imagem"
                    />
                    {(section as any).image_url ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => updateSection(index, { image_url: "" })}
                      >
                        Remover imagem
                      </button>
                    ) : null}
                  </div>
                </div>
                <input
                  placeholder="Legenda"
                  value={(section as any).caption || ""}
                  onChange={(e) => updateSection(index, { caption: e.target.value })}
                  style={{ padding: "0.75rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
                />
              </div>
            );
          }
          return (
            <div key={index} className="card" style={{ padding: "0.75rem", display: "grid", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>Section</strong>
                <button className="btn btn-ghost" onClick={() => removeSection(index)}>
                  Remover
                </button>
              </div>
              <pre style={{ margin: 0, background: "#f8fafc", padding: "0.5rem", borderRadius: 8, overflow: "auto" }}>
                {JSON.stringify(section, null, 2)}
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
};
