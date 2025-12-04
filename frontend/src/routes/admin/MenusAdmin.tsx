import { FormEvent, useEffect, useState } from "react";

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

export const MenusAdmin = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [target, setTarget] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [order, setOrder] = useState<number>(0);
  const [isDropdown, setIsDropdown] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchMenus = async () => {
    const { data } = await api.get("/menus", { params: { per_page: 100 } });
    setItems(data.items || data);
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      label,
      slug,
      target,
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
    setTarget(item.target);
    setParentId(item.parent_id ?? "");
    setOrder(item.order || 0);
    setIsDropdown(item.is_dropdown);
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/menus/${id}`);
    fetchMenus();
  };

  const clearForm = () => {
    setEditingId(null);
    setLabel("");
    setSlug("");
    setTarget("");
    setParentId("");
    setOrder(0);
    setIsDropdown(false);
  };

  const parents = items.filter((i) => !i.parent_id);

  return (
    <div className="grid two">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, color: "var(--muted)" }}>Menus</p>
            <h3 style={{ margin: "0.25rem 0" }}>Organize a navegação</h3>
          </div>
          <button className="btn btn-ghost" type="button" onClick={fetchMenus}>
            Atualizar
          </button>
        </div>
        <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--muted)" }}>
              <th>Rótulo</th>
              <th>Rota</th>
              <th>Ordem</th>
              <th>Parent</th>
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
                  {item.parent_id
                    ? parents.find((p) => p.id === item.parent_id)?.label || "-"
                    : "—"}
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
        <h3 style={{ marginTop: 0 }}>
          {editingId ? "Editar menu" : "Novo menu"}
        </h3>
        <input
          required
          placeholder="Rótulo"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <input
          required
          placeholder="Slug (ex: sobre-nos)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <input
          required
          placeholder="Rota alvo (ex: /sobre)"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <input
            type="number"
            placeholder="Ordem"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value === "" ? "" : Number(e.target.value))}
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          >
            <option value="">Sem parent</option>
            {parents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.label}
              </option>
            ))}
          </select>
        </div>
        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={isDropdown}
            onChange={(e) => setIsDropdown(e.target.checked)}
          />
          Dropdown
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-primary" type="submit">
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
