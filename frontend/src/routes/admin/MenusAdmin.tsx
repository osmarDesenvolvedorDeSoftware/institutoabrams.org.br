import { useEffect, useMemo, useState } from "react";

import { api } from "../../services/api";
import { ContentWizard } from "./components/ContentWizard";

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
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardParentId, setWizardParentId] = useState<number | undefined>(undefined);
  const [orderDrafts, setOrderDrafts] = useState<Record<number, number | undefined>>({});

  const fetchMenus = async () => {
    const { data } = await api.get("/menus", { params: { per_page: 200 } });
    setItems(data.items || data);
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const parents = useMemo(() => items.filter((i) => !i.parent_id), [items]);

  const handleDelete = async (id: number) => {
    await api.delete(`/menus/${id}`);
    fetchMenus();
  };

  const updateOrder = async (id: number, order: number, parent_id: number | null | undefined) => {
    await api.patch(`/menus/${id}`, { order, parent_id });
  };

  const handleMove = async (item: MenuItem, direction: -1 | 1) => {
    const siblings = items
      .filter((i) => i.parent_id === item.parent_id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = siblings.findIndex((m) => m.id === item.id);
    if (idx < 0) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= siblings.length) return;
    const neighbor = siblings[targetIdx];
    const currentOrder = item.order ?? idx + 1;
    const neighborOrder = neighbor.order ?? targetIdx + 1;
    await updateOrder(item.id, neighborOrder, item.parent_id ?? null);
    await updateOrder(neighbor.id, currentOrder, neighbor.parent_id ?? null);
    fetchMenus();
  };

  const handleSaveOrder = async (item: MenuItem) => {
    const draft = orderDrafts[item.id];
    if (draft === undefined || draft === null) return;
    await updateOrder(item.id, Number(draft), item.parent_id ?? null);
    setOrderDrafts((prev) => ({ ...prev, [item.id]: undefined }));
    fetchMenus();
  };

  const handleAddSubmenu = (parent: MenuItem) => {
    setWizardParentId(parent.id);
    setWizardOpen(true);
  };

  const previewTree = useMemo(() => {
    const base = [...items];
    const parentsList = base.filter((m) => !m.parent_id);
    return parentsList
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((parent) => ({
        ...parent,
        children: base
          .filter((c) => c.parent_id === parent.id)
          .sort((a, b) => (a.order || 0) - (b.order || 0)),
      }));
  }, [items]);

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
                    {item.label}
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
        </div>

        <table style={{ width: "100%", marginTop: "0.5rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--muted)" }}>
              <th>Rotulo</th>
              <th>Rota</th>
              <th>Ordem</th>
              <th>Pai</th>
              <th>Acoes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "0.6rem 0" }}>
                  {item.label} {item.is_dropdown ? "(dropdown)" : ""}
                </td>
                <td style={{ padding: "0.6rem 0" }}>{item.target}</td>
                <td style={{ padding: "0.6rem 0" }}>
                  <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                    <input
                      type="number"
                      value={
                        orderDrafts[item.id] !== undefined && orderDrafts[item.id] !== null
                          ? orderDrafts[item.id]
                          : item.order ?? 0
                      }
                      onChange={(e) =>
                        setOrderDrafts((prev) => ({
                          ...prev,
                          [item.id]: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                      style={{ width: 70, padding: "0.35rem 0.45rem", borderRadius: 8, border: "1px solid var(--border)" }}
                    />
                    <button className="btn btn-ghost" type="button" onClick={() => handleSaveOrder(item)}>
                      Salvar
                    </button>
                  </div>
                </td>
                <td style={{ padding: "0.6rem 0" }}>
                  {item.parent_id ? parents.find((p) => p.id === item.parent_id)?.label || "-" : "Sem pai"}
                </td>
                <td style={{ padding: "0.6rem 0", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  <button className="btn btn-ghost" type="button" onClick={() => handleMove(item, -1)}>
                    ↑
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={() => handleMove(item, 1)}>
                    ↓
                  </button>
                </td>
                <td style={{ padding: "0.6rem 0", display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-ghost" onClick={() => handleDelete(item.id)}>
                    Excluir
                  </button>
                  <button className="btn btn-primary" type="button" onClick={() => handleAddSubmenu(item)}>
                    Adicionar submenu
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ContentWizard
        isOpen={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
          setWizardParentId(undefined);
        }}
        onSuccess={() => {
          setWizardOpen(false);
          setWizardParentId(undefined);
          fetchMenus();
        }}
        parentMenuId={wizardParentId}
      />
    </div>
  );
};
