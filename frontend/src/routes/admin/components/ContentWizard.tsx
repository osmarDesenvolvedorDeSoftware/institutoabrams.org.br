
import { useEffect, useMemo, useState } from "react";

import { RichTextEditor } from "../../../components/editor/RichTextEditor";
import { api } from "../../../services/api";

type Template = {
  id: string;
  name: string;
  description?: string;
  content: string;
};

type PageDraft = {
  title: string;
  slug?: string;
  content?: string;
  templateId?: string;
  sections?: any[];
};

type SubPageDraft = PageDraft & {
  order?: number;
};

type WizardType = "simple" | "parent_children";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSelectSingle?: () => void;
};

type MenuConfig = {
  createParentMenu: boolean;
  markParentDropdown: boolean;
  menuOrderParent: number | null;
  childrenOrders: Record<string, number | undefined>;
};

const menuDefaults = (): MenuConfig => ({
  createParentMenu: true,
  markParentDropdown: true,
  menuOrderParent: null,
  childrenOrders: {},
});

export const ContentWizard = ({ isOpen, onClose, onSuccess, onSelectSingle }: Props) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedType, setSelectedType] = useState<WizardType | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [parentPage, setParentPage] = useState<PageDraft>({ title: "", slug: "", content: "" });
  const [subPages, setSubPages] = useState<SubPageDraft[]>([]);
  const [menuConfig, setMenuConfig] = useState<MenuConfig>(menuDefaults());

  const resetState = () => {
    setCurrentStep(1);
    setSelectedType(null);
    setParentPage({ title: "", slug: "", content: "" });
    setSubPages([]);
    setMenuConfig(menuDefaults());
    setError(null);
  };

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    api
      .get("/pages/page-templates")
      .then(({ data }) => setTemplates(data.templates || []))
      .catch(() => setTemplates([]));
  }, [isOpen]);

  const applyTemplate = (templateId?: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return "";
    return tpl.content || "";
  };

  const canGoNext = useMemo(() => {
    if (currentStep === 1) {
      return Boolean(selectedType);
    }
    if (currentStep === 2) {
      if (!parentPage.title.trim()) return false;
      if (selectedType === "parent_children") {
        return subPages.length > 0 && subPages.every((sp) => sp.title.trim());
      }
      return true;
    }
    return true;
  }, [currentStep, selectedType, parentPage.title, subPages]);

  const goNext = () => {
    if (!canGoNext) return;
    if (currentStep === 1 && selectedType === "simple") {
      if (onSelectSingle) {
        onSelectSingle();
      }
      onClose();
      resetState();
      return;
    }
    if (currentStep < 4) setCurrentStep((prev) => (prev + 1) as any);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as any);
  };

  const handleSubmit = async () => {
    if (selectedType !== "parent_children") {
      setError("Selecione o tipo de criação.");
      return;
    }
    if (!parentPage.title.trim()) {
      setError("Preencha o título da página principal.");
      return;
    }
    if (subPages.length === 0 || !subPages.every((sp) => sp.title.trim())) {
      setError("Adicione ao menos uma subpágina com título.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const children = subPages
        .filter((c) => c.title.trim())
        .map((c) => ({
          title_translations: { pt: c.title },
          content_translations: { pt: c.content || "" },
          sections: c.sections,
          slug: c.slug || undefined,
          is_published: true,
        }));
      const children_menu_orders = subPages
        .map((c) => ({
          slug_or_title: c.slug || c.title,
          order: menuConfig.childrenOrders[c.slug || c.title] ?? c.order ?? null,
        }))
        .filter((c) => c.order !== null) as { slug_or_title: string; order: number }[];

      const payload = {
        parent_page: {
          title_translations: { pt: parentPage.title },
          content_translations: { pt: parentPage.content || "" },
          sections: parentPage.sections,
          slug: parentPage.slug || undefined,
          is_published: true,
        },
        children,
        create_parent_menu: menuConfig.createParentMenu,
        mark_parent_dropdown: menuConfig.markParentDropdown,
        menu_order_parent: menuConfig.menuOrderParent ?? null,
        children_menu_orders,
      };
      await api.post("/pages/bulk-with-menus", payload);

      onSuccess();
      onClose();
      resetState();
    } catch (err: any) {
      setError("Erro ao salvar. Verifique os campos e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 999,
        display: "grid",
        placeItems: "center",
        padding: "1.5rem",
      }}
    >
      <div
        className="card"
        style={{
          width: "min(1100px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
          display: "grid",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Assistente de criação</h2>
          <button className="btn btn-ghost" onClick={onClose}>
            Fechar
          </button>
        </div>

        {currentStep === 1 && (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <p style={{ margin: 0, color: "var(--muted)" }}>Escolha o tipo de página</p>
            <div className="grid two">
              {[
                { key: "simple", label: "Página única" },
                { key: "parent_children", label: "Página pai com subpáginas" },
              ].map((opt) => (
                <label
                  key={opt.key}
                  className="card"
                  style={{
                    cursor: "pointer",
                    border: selectedType === opt.key ? "2px solid var(--primary)" : "1px solid var(--border)",
                  }}
                >
                  <input
                    type="radio"
                    name="wizard-type"
                    value={opt.key}
                    checked={selectedType === opt.key}
                    onChange={() => setSelectedType(opt.key as WizardType)}
                    style={{ marginRight: "0.5rem" }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && selectedType === "parent_children" && (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <p style={{ margin: 0, color: "var(--muted)" }}>Dados da(s) página(s)</p>

            <div className="card" style={{ display: "grid", gap: "0.5rem" }}>
              <input
                placeholder="Título (pt) da página"
                value={parentPage.title}
                onChange={(e) => setParentPage({ ...parentPage, title: e.target.value })}
                style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
              />
              <input
                placeholder="Slug (opcional)"
                value={parentPage.slug || ""}
                onChange={(e) => setParentPage({ ...parentPage, slug: e.target.value })}
                style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
              />
              <select
                value={parentPage.templateId || ""}
                onChange={(e) => {
                  const tplId = e.target.value || undefined;
                  setParentPage({
                    ...parentPage,
                    templateId: tplId,
                    content: tplId ? applyTemplate(tplId) : parentPage.content,
                  });
                }}
                style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
              >
                <option value="">Template (opcional)</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
              <div className="editor-shell">
                <RichTextEditor
                  value={parentPage.content || ""}
                  onChange={(v) => setParentPage({ ...parentPage, content: v })}
                />
              </div>
            </div>

            <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0 }}>Subpáginas</h4>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => setSubPages([...subPages, { title: "", slug: "", content: "" }])}
                >
                  Adicionar subpágina
                </button>
              </div>
              <div className="grid two">
                {subPages.map((sp, idx) => (
                  <div key={idx} className="card" style={{ display: "grid", gap: "0.5rem" }}>
                    <input
                      placeholder="Título (pt)"
                      value={sp.title}
                      onChange={(e) => {
                        const clone = [...subPages];
                        clone[idx] = { ...clone[idx], title: e.target.value };
                        setSubPages(clone);
                      }}
                      style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
                    />
                    <input
                      placeholder="Slug (opcional)"
                      value={sp.slug || ""}
                      onChange={(e) => {
                        const clone = [...subPages];
                        clone[idx] = { ...clone[idx], slug: e.target.value };
                        setSubPages(clone);
                      }}
                      style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
                    />
                    <textarea
                      placeholder="Conteúdo curto (HTML permitido)"
                      value={sp.content || ""}
                      onChange={(e) => {
                        const clone = [...subPages];
                        clone[idx] = { ...clone[idx], content: e.target.value };
                        setSubPages(clone);
                      }}
                      style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)", minHeight: 120 }}
                    />
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => setSubPages(subPages.filter((_, i) => i !== idx))}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && selectedType === "parent_children" && (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <p style={{ margin: 0, color: "var(--muted)" }}>Configuração de menu</p>
            <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
              <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={menuConfig.createParentMenu}
                  onChange={(e) => setMenuConfig({ ...menuConfig, createParentMenu: e.target.checked })}
                />
                Criar menu pai
              </label>
              <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={menuConfig.markParentDropdown}
                  onChange={(e) => setMenuConfig({ ...menuConfig, markParentDropdown: e.target.checked })}
                />
                Marcar pai como dropdown
              </label>
              <input
                type="number"
                placeholder="Ordem do menu pai"
                value={menuConfig.menuOrderParent ?? ""}
                onChange={(e) =>
                  setMenuConfig({ ...menuConfig, menuOrderParent: e.target.value ? Number(e.target.value) : null })
                }
                style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
              />
              <div className="card" style={{ display: "grid", gap: "0.35rem" }}>
                <p style={{ margin: 0, fontWeight: 600 }}>Ordem das subpáginas</p>
                {subPages.length === 0 && <small style={{ color: "var(--muted)" }}>Nenhuma subpágina adicionada.</small>}
                {subPages.map((sp, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.5rem" }}>
                    <span>{sp.title || sp.slug || `Subpágina ${idx + 1}`}</span>
                    <input
                      type="number"
                      placeholder="Ordem"
                      value={menuConfig.childrenOrders[sp.slug || sp.title] ?? ""}
                      onChange={(e) => {
                        const key = sp.slug || sp.title;
                        setMenuConfig({
                          ...menuConfig,
                          childrenOrders: {
                            ...menuConfig.childrenOrders,
                            [key]: e.target.value ? Number(e.target.value) : undefined,
                          },
                        });
                      }}
                      style={{ padding: "0.65rem 0.85rem", borderRadius: 10, border: "1px solid var(--border)" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && selectedType === "parent_children" && (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <p style={{ margin: 0, color: "var(--muted)" }}>Resumo</p>
            <div className="card" style={{ display: "grid", gap: "0.35rem" }}>
              <strong>Página principal:</strong> {parentPage.title || "-"}
              <div>
                <strong>Subpáginas:</strong>
                <ul>
                  {subPages.map((sp, idx) => (
                    <li key={idx}>{sp.title || sp.slug || `Subpágina ${idx + 1}`}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Menu pai:</strong>{" "}
                {menuConfig.createParentMenu
                  ? `criar (dropdown: ${menuConfig.markParentDropdown ? "sim" : "não"})`
                  : "não criar"}
              </div>
            </div>
          </div>
        )}

        {error && <div style={{ color: "tomato" }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
          <button className="btn btn-ghost" onClick={goBack} disabled={currentStep === 1}>
            Voltar
          </button>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {currentStep < 4 && (
              <button className="btn btn-primary" onClick={goNext} disabled={!canGoNext}>
                {currentStep === 1 && selectedType === "simple" ? "Continuar" : "Próximo"}
              </button>
            )}
            {currentStep === 4 && (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "Enviando..." : "Enviar"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
