import { useEffect, useMemo, useState } from "react";

import { RichTextEditor } from "../../../components/editor/RichTextEditor";
import { api } from "../../../services/api";

type Template = {
  id: string;
  name: string;
  description?: string;
  format?: string;
  content: string;
};

type MenuItem = {
  id: number;
  label: string;
};

type PageItem = {
  id: number;
  slug: string;
  title_translations: Record<string, string>;
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

type WizardType = "simple" | "page_menu" | "parent_children" | "submenu_existing";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentMenuId?: number;
};

export const ContentWizard = ({ isOpen, onClose, onSuccess, parentMenuId }: Props) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedType, setSelectedType] = useState<WizardType | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Page data
  const [parentPage, setParentPage] = useState<PageDraft>({ title: "", slug: "", content: "" });
  const [subPages, setSubPages] = useState<SubPageDraft[]>([]);
  const [submenuPageMode, setSubmenuPageMode] = useState<"existing" | "new">("existing");
  const [submenuExistingPageId, setSubmenuExistingPageId] = useState<number | null>(null);
  const [submenuNewPage, setSubmenuNewPage] = useState<PageDraft>({ title: "", slug: "", content: "" });

  // Menu config
  const menuDefaults = (type?: WizardType | null) => ({
    createMenu: type === "simple" ? false : type === "submenu_existing" ? false : true,
    menuParentId: null,
    menuOrder: null,
    createParentMenu: type === "parent_children" ? true : false,
    markParentDropdown: type === "parent_children" ? true : false,
    menuOrderParent: null,
    childrenOrders: {} as Record<string, number | undefined>,
    submenuOrder: null as number | null,
  });

  const [menuConfig, setMenuConfig] = useState(menuDefaults());

  const resetState = () => {
    const isSubmenuFlow = Boolean(parentMenuId);
    setCurrentStep(isSubmenuFlow ? 2 : 1);
    setSelectedType(isSubmenuFlow ? "submenu_existing" : null);
    setParentPage({ title: "", slug: "", content: "" });
    setSubPages([]);
    setSubmenuPageMode("existing");
    setSubmenuExistingPageId(null);
    setSubmenuNewPage({ title: "", slug: "", content: "" });
    setMenuConfig(menuDefaults(isSubmenuFlow ? "submenu_existing" : null));
    setError(null);
  };

  const selectType = (type: WizardType) => {
    if (type === "submenu_existing" && !parentMenuId) {
      // Sem pai definido, não permite esse fluxo
      setError("Selecione um menu pai para criar submenu.");
      return;
    }
    setSelectedType(type);
    setParentPage({ title: "", slug: "", content: "" });
    setSubPages([]);
    setSubmenuPageMode("existing");
    setSubmenuExistingPageId(null);
    setSubmenuNewPage({ title: "", slug: "", content: "" });
    setMenuConfig(menuDefaults(type));
    setError(null);
    setCurrentStep(type === "submenu_existing" && parentMenuId ? 2 : 1);
  };

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen, parentMenuId]);

  useEffect(() => {
    if (!isOpen) return;
    api
      .get("/page-templates")
      .then(({ data }) => setTemplates(data.templates || []))
      .catch(() => setTemplates([]));
    api
      .get("/menus", { params: { per_page: 200 } })
      .then(({ data }) => setMenus(data.items || data))
      .catch(() => setMenus([]));
    api
      .get("/pages", { params: { per_page: 200 } })
      .then(({ data }) => setPages(data.items || data))
      .catch(() => setPages([]));
  }, [isOpen]);

  useEffect(() => {
    if (selectedType === "simple") {
      setMenuConfig(menuDefaults("simple"));
    }
  }, [selectedType]);

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
      if (selectedType === "submenu_existing") {
        return parentMenuId
          ? submenuPageMode === "existing"
            ? Boolean(submenuExistingPageId)
            : Boolean(submenuNewPage.title)
          : false;
      }
      if (!parentPage.title.trim()) return false;
      if (selectedType === "parent_children") {
        return subPages.length > 0 && subPages.every((sp) => sp.title.trim());
      }
      return true;
    }
    return true;
  }, [currentStep, selectedType, submenuPageMode, submenuExistingPageId, submenuNewPage.title, parentPage.title, subPages]);

  const goNext = () => {
    if (!canGoNext) return;
    if (selectedType === "simple" && currentStep === 2) {
      setCurrentStep(4);
      return;
    }
    if (currentStep < 4) setCurrentStep((prev) => (prev + 1) as any);
  };

  const goBack = () => {
    if (parentMenuId && currentStep === 2) return;
    if (selectedType === "simple" && currentStep === 4) {
      setCurrentStep(2);
      return;
    }
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as any);
  };

  const summary = useMemo(
    () => ({
      type: selectedType,
      parentPage,
      subPages,
      menuConfig,
      submenuPageMode,
      submenuExistingPageId,
      submenuNewPage,
    }),
    [selectedType, parentPage, subPages, menuConfig, submenuPageMode, submenuExistingPageId, submenuNewPage],
  );

  const handleSubmit = async () => {
    if (!selectedType) {
      setError("Selecione um tipo de criacao.");
      return;
    }
    // Validações específicas antes de enviar
    if (selectedType !== "submenu_existing" && !parentPage.title.trim()) {
      setError("Preencha o titulo da pagina.");
      return;
    }
    if (selectedType === "parent_children" && (subPages.length === 0 || !subPages.every((sp) => sp.title.trim()))) {
      setError("Adicione ao menos uma subpagina com titulo.");
      return;
    }
    if (selectedType === "submenu_existing") {
      if (!parentMenuId) {
        setError("Selecione um menu pai para o submenu.");
        return;
      }
      if (submenuPageMode === "existing" && !submenuExistingPageId) {
        setError("Selecione a pagina existente para o submenu.");
        return;
      }
      if (submenuPageMode === "new" && !submenuNewPage.title.trim()) {
        setError("Preencha o titulo da nova pagina.");
        return;
      }
    }
    setLoading(true);
    setError(null);
    try {
      if (selectedType === "simple") {
        const payload = {
          page: {
            title_translations: { pt: parentPage.title },
            content_translations: { pt: parentPage.content || "" },
            sections: parentPage.sections,
            slug: parentPage.slug || undefined,
            is_published: true,
          },
          create_menu: false,
        };
        await api.post("/pages/with-menu", payload);
      }

      if (selectedType === "page_menu") {
        const payload = {
          page: {
            title_translations: { pt: parentPage.title },
            content_translations: { pt: parentPage.content || "" },
            sections: parentPage.sections,
            slug: parentPage.slug || undefined,
            is_published: true,
          },
          create_menu: menuConfig.createMenu,
          menu_parent_id: menuConfig.menuParentId || null,
          menu_order: menuConfig.menuOrder ?? null,
        };
        await api.post("/pages/with-menu", payload);
      }

      if (selectedType === "parent_children") {
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
      }

      if (selectedType === "submenu_existing") {
        if (!parentMenuId) {
          throw new Error("Parent menu nao informado");
        }
        const payload =
          submenuPageMode === "existing"
            ? {
                use_existing_page_id: submenuExistingPageId,
                order: menuConfig.submenuOrder ?? null,
              }
            : {
                page: {
                  title_translations: { pt: submenuNewPage.title },
                  content_translations: { pt: submenuNewPage.content || "" },
                  sections: submenuNewPage.sections,
                  slug: submenuNewPage.slug || undefined,
                  is_published: true,
                },
                order: menuConfig.submenuOrder ?? null,
              };
        await api.post(`/menus/${parentMenuId}/add-submenu`, payload);
      }

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
          <h2 style={{ margin: 0 }}>Assistente de Conteudo</h2>
          <button className="btn btn-ghost" onClick={onClose}>
            Fechar
          </button>
        </div>

        {currentStep === 1 && (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <p style={{ margin: 0, color: "var(--muted)" }}>Selecione o tipo de criacao</p>
            <div className="grid two">
              {[
                { key: "page_menu", label: "Pagina + Item no Menu" },
                { key: "parent_children", label: "Pagina Pai com Submenus" },
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
                    onChange={() => selectType(opt.key as WizardType)}
                    style={{ marginRight: "0.5rem" }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <p style={{ margin: 0, color: "var(--muted)" }}>Dados da(s) pagina(s)</p>

            {(selectedType === "simple" || selectedType === "page_menu" || selectedType === "parent_children") && (
              <div className="card" style={{ display: "grid", gap: "0.5rem" }}>
                <input
                  placeholder="Titulo (pt) da pagina"
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
            )}

            {selectedType === "parent_children" && (
              <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0 }}>Subpaginas</h4>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => setSubPages([...subPages, { title: "", slug: "", content: "" }])}
                  >
                    Adicionar subpagina
                  </button>
                </div>
                <div className="grid two">
                  {subPages.map((sp, idx) => (
                    <div key={idx} className="card" style={{ display: "grid", gap: "0.5rem" }}>
                      <input
                        placeholder="Titulo (pt)"
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
                        placeholder="Conteudo curto (HTML permitido)"
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
            )}

            {selectedType === "submenu_existing" && (
              <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <label style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                    <input
                      type="radio"
                      checked={submenuPageMode === "existing"}
                      onChange={() => setSubmenuPageMode("existing")}
                    />
                    Usar pagina existente
                  </label>
                  <label style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                    <input
                      type="radio"
                      checked={submenuPageMode === "new"}
                      onChange={() => setSubmenuPageMode("new")}
                    />
                    Criar nova pagina
                  </label>
                </div>

                {submenuPageMode === "existing" ? (
                  <select
                    value={submenuExistingPageId || ""}
                    onChange={(e) => setSubmenuExistingPageId(e.target.value ? Number(e.target.value) : null)}
                    style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
                  >
                    <option value="">Selecione uma pagina</option>
                    {pages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title_translations?.pt || p.slug}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    <input
                      placeholder="Titulo (pt)"
                      value={submenuNewPage.title}
                      onChange={(e) => setSubmenuNewPage({ ...submenuNewPage, title: e.target.value })}
                      style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
                    />
                    <input
                      placeholder="Slug (opcional)"
                      value={submenuNewPage.slug || ""}
                      onChange={(e) => setSubmenuNewPage({ ...submenuNewPage, slug: e.target.value })}
                      style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
                    />
                    <textarea
                      placeholder="Conteudo (HTML permitido)"
                      value={submenuNewPage.content || ""}
                      onChange={(e) => setSubmenuNewPage({ ...submenuNewPage, content: e.target.value })}
                      style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)", minHeight: 120 }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && selectedType !== "simple" && (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <p style={{ margin: 0, color: "var(--muted)" }}>Configuracao de menu</p>

            {selectedType === "page_menu" && (
              <div className="card" style={{ display: "grid", gap: "0.5rem" }}>
                <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={menuConfig.createMenu}
                    onChange={(e) => setMenuConfig({ ...menuConfig, createMenu: e.target.checked })}
                  />
                  Criar item no menu
                </label>
                <select
                  value={menuConfig.menuParentId || ""}
                  onChange={(e) =>
                    setMenuConfig({ ...menuConfig, menuParentId: e.target.value ? Number(e.target.value) : null })
                  }
                  style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
                >
                  <option value="">Menu nivel 1</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Ordem (opcional)"
                  value={menuConfig.menuOrder ?? ""}
                  onChange={(e) =>
                    setMenuConfig({ ...menuConfig, menuOrder: e.target.value ? Number(e.target.value) : null })
                  }
                  style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
                />
              </div>
            )}

            {selectedType === "parent_children" && (
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
                  <p style={{ margin: 0, fontWeight: 600 }}>Ordem das subpaginas</p>
                  {subPages.length === 0 && <small style={{ color: "var(--muted)" }}>Nenhuma subpagina adicionada.</small>}
                  {subPages.map((sp, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.5rem" }}>
                      <span>{sp.title || sp.slug || `Subpagina ${idx + 1}`}</span>
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
            )}

            {selectedType === "submenu_existing" && parentMenuId && (
              <div className="card" style={{ display: "grid", gap: "0.5rem" }}>
                <p style={{ margin: 0 }}>Submenu para menu #{parentMenuId}</p>
                <input
                  type="number"
                  placeholder="Ordem (opcional)"
                  value={menuConfig.submenuOrder ?? ""}
                  onChange={(e) =>
                    setMenuConfig({ ...menuConfig, submenuOrder: e.target.value ? Number(e.target.value) : null })
                  }
                  style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
                />
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <p style={{ margin: 0, color: "var(--muted)" }}>Resumo</p>
            <div className="card" style={{ display: "grid", gap: "0.35rem" }}>
              <strong>Tipo:</strong> {selectedType}
              <strong>Pagina principal:</strong> {parentPage.title || "-"}
              {selectedType === "parent_children" && (
                <div>
                  <strong>Subpaginas:</strong>
                  <ul>
                    {subPages.map((sp, idx) => (
                      <li key={idx}>{sp.title || sp.slug || `Subpagina ${idx + 1}`}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedType === "page_menu" && (
                <div>
                  <strong>Menu pai:</strong> {menuConfig.menuParentId || "Nivel 1"} | Ordem:{" "}
                  {menuConfig.menuOrder ?? "auto"}
                </div>
              )}
              {selectedType === "parent_children" && (
                <div>
                  <strong>Menu pai:</strong>{" "}
                  {menuConfig.createParentMenu ? `criar (dropdown: ${menuConfig.markParentDropdown ? "sim" : "nao"})` : "nao criar"}
                </div>
              )}
              {selectedType === "submenu_existing" && parentMenuId && (
                <div>
                  <strong>Submenu do menu:</strong> #{parentMenuId} | Ordem: {menuConfig.submenuOrder ?? "auto"}
                </div>
              )}
              <pre
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e5e7eb",
                  padding: "0.75rem",
                  borderRadius: 8,
                  overflow: "auto",
                }}
              >
                {JSON.stringify(summary, null, 2)}
              </pre>
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
                Proximo
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
