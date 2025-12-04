import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../context/AuthContext";
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

const fallbackNav: MenuItem[] = [
  { id: 1, label: "Home", slug: "home", target: "/", is_dropdown: false },
  { id: 2, label: "Projetos", slug: "projetos", target: "/projetos", is_dropdown: false },
  { id: 3, label: "Oportunidades", slug: "oportunidades", target: "/oportunidades", is_dropdown: false },
  { id: 4, label: "Contato", slug: "contato", target: "/contato", is_dropdown: false },
];

export const PublicLayout = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const currentLang = (i18n.language || "pt").slice(0, 2);

  useEffect(() => {
    api
      .get("/menus")
      .then(({ data }) => setMenus(data.items || data))
      .catch(() => setMenus([]));
  }, []);

  const menuTree = useMemo(() => {
    const source = menus.length ? menus : fallbackNav;
    const parents = source.filter((m) => !m.parent_id);
    return parents
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((parent) => ({
        ...parent,
        children: menus
          .filter((c) => c.parent_id === parent.id)
          .sort((a, b) => (a.order || 0) - (b.order || 0)),
      }));
  }, [menus]);

  const isActive = (target: string) =>
    pathname === target || pathname.startsWith(target + "/");

  return (
    <div className="app-shell">
      <header
        style={{
          background: "var(--primary)",
          color: "#fff",
          boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1.5rem",
            gap: "1rem",
          }}
        >
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "#fff",
              fontWeight: 800,
              letterSpacing: "0.5px",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: "#fff",
                color: "var(--primary-dark)",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
              }}
            >
              A
            </div>
            Instituto ABRAMS
          </Link>

          <nav style={{ display: "flex", gap: "1rem", alignItems: "center", position: "relative" }}>
            {menuTree.map((item) =>
              item.children && item.children.length > 0 ? (
                <div
                  key={item.id}
                  style={{ position: "relative" }}
                  onMouseEnter={(e) => {
                    const menu = e.currentTarget.querySelector(".dropdown");
                    if (menu) (menu as HTMLElement).style.display = "grid";
                  }}
                  onMouseLeave={(e) => {
                    const menu = e.currentTarget.querySelector(".dropdown");
                    if (menu) (menu as HTMLElement).style.display = "none";
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      padding: "0.35rem 0.5rem",
                      borderRadius: 8,
                      background: isActive(item.target)
                        ? "rgba(255,255,255,0.14)"
                        : "transparent",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    {item.label}
                    <span style={{ fontSize: 10 }}>▼</span>
                  </span>
                  <div
                    className="dropdown"
                    style={{
                      position: "absolute",
                      top: "110%",
                      left: 0,
                      background: "#fff",
                      color: "var(--text)",
                      borderRadius: 8,
                      minWidth: 180,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      display: "grid",
                      gap: "0.25rem",
                      padding: "0.5rem",
                      zIndex: 10,
                      display: "none",
                    }}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        to={child.target}
                        style={{
                          padding: "0.5rem 0.6rem",
                          borderRadius: 6,
                          background: isActive(child.target)
                            ? "rgba(196,153,23,0.15)"
                            : "transparent",
                          fontWeight: 600,
                        }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.id}
                  to={item.target}
                  style={{
                    fontWeight: 700,
                    color: "#fff",
                    padding: "0.35rem 0.5rem",
                    borderRadius: 8,
                    background: isActive(item.target)
                      ? "rgba(255,255,255,0.14)"
                      : "transparent",
                  }}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <select
              value={currentLang}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              style={{
                padding: "0.35rem 0.65rem",
                fontWeight: 600,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.6)",
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
              }}
            >
              <option value="pt">PT</option>
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
            </select>
            {isAuthenticated ? (
              <Link className="btn btn-ghost" to="/admin" style={{ color: "#fff" }}>
                Painel
              </Link>
            ) : (
              <Link className="btn btn-ghost" to="/admin/login" style={{ color: "#fff" }}>
                {t("admin")}
              </Link>
            )}
          </div>
        </div>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "1.5rem 0",
          marginTop: "2rem",
          background: "#fff",
        }}
      >
        <div
          className="container"
          style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}
        >
          <div>
            <strong>Instituto ABRAMS</strong>
            <p style={{ margin: 0, color: "var(--muted)" }}>
              Construindo futuro com oportunidades e propósito.
            </p>
          </div>
          <small style={{ color: "#777" }}>© {new Date().getFullYear()}</small>
        </div>
      </footer>
    </div>
  );
};
