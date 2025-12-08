import { FormEvent, useEffect, useMemo, useState } from "react";

import { api } from "../../services/api";

type MenuItem = {
  id: number;
  label: string;
  slug: string;
  target: string;
  is_dropdown: boolean;
  parent_id?: number | null;
  order?: number;
};

type Page = {
  id: number;
  slug: string;
  title_translations: Record<string, string>;
};

type LinkType = "fixo" | "pagina" | "externo";

const fixedRoutes = [
  { label: "Inicio", value: "/" },
  { label: "Quem Somos", value: "/quem-somos" },
  { label: "Projetos", value: "/projetos" },
  { label: "Oportunidades", value: "/oportunidades" },
  { label: "Noticias", value: "/noticias" },
  { label: "Portfolio", value: "/portfolio" },
  { label: "Doacao", value: "/doacao" },
  { label: "Contato", value: "/contato" },
];

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);

export const MenusAdmin = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [pages, setPages] = useState<Page[]>([]);

  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [linkType, setLinkType] = useState<LinkType>("fixo");
  const [fixedValue, setFixedValue] = useState("");
  const [pageValue, setPageValue] = useState("");
  const [externalValue, setExternalValue] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [order, setOrder] = useState<number>(0);
  const [isDropdown, setIsDropdown] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchMenus = async () => {
    const { data } = await api.get("/menus", { params: { per_page: 200 } });
    setItems(data.items || data);
  };

  useEffect(() => {
    fetchMenus();
    api
      .get("/api/v1/pages", { params: { is_published: true, per_page: 200 } })
      .then(({ data }) => setPages(data.items || data))
      .catch(() => setPages([]));
  }, []);

  const parents = useMemo(() => items.filter((i) => !i.parent_id), [items]);

  const pageOptions = useMemo(
    () =>
      pages.map((p) => ({
        label: p.title_translations?.pt || p.slug,
        value: `/pages/${p.slug}`,
      })),
    [pages],
  );

  const currentTarget = useMemo(() => {
    if (linkType === "externo") return externalValue.trim();
    if (linkType === "pagina") return pageValue;
    return fixedValue;
  }, [linkType, externalValue, pageValue, fixedValue]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentTarget) return;
    const payload = {
      label,
      slug,
      target: currentTarget,
      parent_id: parentId === "" ? null : Number(parentId),
      order,
      is_dropdown: isDropdown,
    };
    if (editingId) {
      await api.put(`/menus/${editingId}`, payload);
    } else {
      await api.post("/menus", payload);
    }
    clearForm();
    fetchMenus();
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setLabel(item.label);
    setSlug(item.slug);
    setParentId(item.parent_id ?? "");
    setOrder(item.order || 0);
    setIsDropdown(item.is_dropdown);

    if (item.target.startsWith("http")) {
      setLinkType("externo");
      setExternalValue(item.target);
      setFixedValue("");
      setPageValue("");
    } else if (item.target.startsWith("/pages/")) {
      setLinkType("pagina");
      setPageValue(item.target);
      setFixedValue("");
      setExternalValue("");
    } else {
      setLinkType("fixo");
      setFixedValue(item.target);
      setPageValue("");
      setExternalValue("");
    }
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/menus/${id}`);
    fetchMenus();
  };

  const clearForm = () => {
    setEditingId(null);
    setLabel("");
    setSlug("");
    setLinkType("fixo");
    setFixedValue("");
    setPageValue("");
    setExternalValue("");
    setParentId("");
    setOrder(0);
    setIsDropdown(false);
  };

  const previewTree = useMemo(() => {
    const base = [...items];
    if (label && currentTarget) {
      base.push({
        id: -1,
        label: `${label} (rascunho)`,
        slug,
        target: currentTarget,
        is_dropdown: isDropdown,
        parent_id: parentId === "" ? null : Number(parentId),
        order: order || 0,
      });
    }
    const parentsList = base.filter((m) => !m.parent_id);
    return parentsList
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((parent) => ({
        ...parent,
        children: base
          .filter((c) => c.parent_id === parent.id)
          .sort((a, b) => (a.order || 0) - (b.order || 0)),
      }));
  }, [items, label, currentTarget, parentId, order, isDropdown, slug]);

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
            <p style={{ margin: 0, color: "var(--muted)" }}>Navegacao</p>
            <h3 style={{ margin: "0.25rem 0" }}>Menu atual</h3>
          </div>
          <button className="btn btn-ghost" type="button" onClick={fetchMenus}>
            Atualizar
          </button>
        </div>

        <div className="card" style={{ background: "#f9fafb", display: "grid", gap: "0.75rem" }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Preview rapido</p>
          <nav style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {previewTree.map((item) =>
              item.children && item.children.length > 0 ? (
                <div key={item.id} style={{ position: "relative" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      padding: "0.35rem 0.5rem",
                      borderRadius: 8,
                      background: "rgba(207,175,112,0.15)",
                    }}
                  >
                    {item.label} ▼
                  </span>
                  <div
                    style={{
                      display: "grid",
                      gap: "0.35rem",
                      marginTop: "0.35rem",
                      padding: "0.45rem",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "#fff",
                    }}
                  >
                    {item.children.map((child) => (
                      <span key={child.id} style={{ fontWeight: 600 }}>
                        {child.label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <span key={item.id} style={{ fontWeight: 700, padding: "0.35rem 0.5rem" }}>
                  {item.label}
                </span>
              ),
            )}
          </nav>
          <small style={{ color: "var(--muted)" }}>
            O item em rascunho aparece com sufixo (rascunho) e ainda nao foi salvo.
          </small>
        </div>

        <table style={{ width: "100%", marginTop: "0.5rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--muted)" }}>
              <th>Rotulo</th>
              <th>Rota</th>
              <th>Ordem</th>
              <th>Pai</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "0.6rem 0" }}>
                  {item.label} {item.is_dropdown ? "▼" : ""}
                </td>
                <td style={{ padding: "0.6rem 0" }}>{item.target}</td>
                <td style={{ padding: "0.6rem 0" }}>{item.order ?? 0}</td>
                <td style={{ padding: "0.6rem 0" }}>
                  {item.parent_id ? parents.find((p) => p.id === item.parent_id)?.label || "-" : "Sem pai"}
                </td>
                <td style={{ padding: "0.6rem 0", display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-ghost" onClick={() => handleEdit(item)}>
                    Editar
                  </button>
                  <button className="btn btn-ghost" onClick={() => handleDelete(item.id)}>
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
          <div>
            <p style={{ margin: 0, color: "var(--muted)" }}>Assistente</p>
            <h3 style={{ margin: 0 }}>{editingId ? "Editar item" : "Novo item de menu"}</h3>
          </div>
          {editingId && (
            <button className="btn btn-ghost" type="button" onClick={clearForm}>
              Cancelar
            </button>
          )}
        </div>

        <div style={{ display: "grid", gap: "0.5rem" }}>
          <label style={{ fontWeight: 600 }}>Tipo de link</label>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {(["fixo", "pagina", "externo"] as LinkType[]).map((type) => (
              <label key={type} style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                <input
                  type="radio"
                  name="linkType"
                  value={type}
                  checked={linkType === type}
                  onChange={() => setLinkType(type)}
                />
                {type === "fixo" && "Rota fixa"}
                {type === "pagina" && "Pagina do site"}
                {type === "externo" && "Link externo"}
              </label>
            ))}
          </div>
        </div>

        {linkType === "fixo" && (
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <label style={{ fontWeight: 600 }}>Rota fixa</label>
            <select
              value={fixedValue}
              onChange={(e) => setFixedValue(e.target.value)}
              style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
            >
              <option value="">Selecione</option>
              {fixedRoutes.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} ({r.value})
                </option>
              ))}
            </select>
          </div>
        )}

        {linkType === "pagina" && (
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <label style={{ fontWeight: 600 }}>Pagina do CMS (publicada)</label>
            <select
              value={pageValue}
              onChange={(e) => setPageValue(e.target.value)}
              style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
            >
              <option value="">Selecione</option>
              {pageOptions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label} ({p.value})
                </option>
              ))}
            </select>
          </div>
        )}

        {linkType === "externo" && (
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <label style={{ fontWeight: 600 }}>URL externa (https://...)</label>
            <input
              type="url"
              placeholder="https://exemplo.com"
              value={externalValue}
              onChange={(e) => setExternalValue(e.target.value)}
              style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
            />
          </div>
        )}

        <div style={{ display: "grid", gap: "0.35rem" }}>
          <label style={{ fontWeight: 600 }}>Rotulo exibido</label>
          <input
            required
            placeholder="Ex.: Projetos"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              if (!editingId && !slug) {
                setSlug(slugify(e.target.value));
              }
            }}
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
        </div>

        <div style={{ display: "grid", gap: "0.35rem" }}>
          <label style={{ fontWeight: 600 }}>Slug do menu</label>
          <input
            required
            placeholder="ex: projetos"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <label style={{ fontWeight: 600 }}>Ordem</label>
            <input
              type="number"
              placeholder="0"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
            />
          </div>
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <label style={{ fontWeight: 600 }}>Pai (vira submenu)</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value === "" ? "" : Number(e.target.value))}
              style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
            >
              <option value="">Sem pai (nivel 1)</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="checkbox" checked={isDropdown} onChange={(e) => setIsDropdown(e.target.checked)} />
          Marcar como dropdown
        </label>

        <div style={{ display: "grid", gap: "0.35rem" }}>
          <label style={{ fontWeight: 600 }}>URL final (preview)</label>
          <input
            value={currentTarget}
            readOnly
            placeholder="Selecione uma rota ou insira a URL"
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)", background: "#f9fafb" }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button className="btn btn-primary" type="submit" disabled={!label || !slug || !currentTarget}>
            {editingId ? "Atualizar" : "Salvar"}
          </button>
          {editingId && (
            <button className="btn btn-ghost" type="button" onClick={clearForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
