import { Link, Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header
        style={{
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--border)",
          background: "#fff",
          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.05)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link to="/" style={{ fontWeight: 800, color: "#1f2937" }}>
              ABRAMS Admin
            </Link>
            <nav style={{ display: "flex", gap: "0.5rem" }}>
              <Link to="/admin" style={{ padding: "0.45rem 0.7rem", borderRadius: 8, color: "#1f2937", fontWeight: 600 }}>
                Dashboard
              </Link>
              <Link to="/admin/paginas" style={{ padding: "0.45rem 0.7rem", borderRadius: 8, color: "#1f2937", fontWeight: 600 }}>
                Páginas
              </Link>
              <Link to="/admin/menus" style={{ padding: "0.45rem 0.7rem", borderRadius: 8, color: "#1f2937", fontWeight: 600 }}>
                Menus
              </Link>
              <Link to="/admin/oportunidades" style={{ padding: "0.45rem 0.7rem", borderRadius: 8, color: "#1f2937", fontWeight: 600 }}>
                Oportunidades
              </Link>
            </nav>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <span style={{ color: "#475569", fontWeight: 600 }}>
              {user?.name}
            </span>
            <button className="btn btn-ghost" onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </header>
      <main style={{ flex: 1, padding: "1.5rem 0" }}>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
