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
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link to="/" style={{ fontWeight: 800 }}>
              ABRAMS Admin
            </Link>
            <nav style={{ display: "flex", gap: "0.75rem" }}>
              <Link to="/admin">Dashboard</Link>
              <Link to="/admin/paginas">Páginas</Link>
              <Link to="/admin/menus">Menus</Link>
              <Link to="/admin/oportunidades">Oportunidades</Link>
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
