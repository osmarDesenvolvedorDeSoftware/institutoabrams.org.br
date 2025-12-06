import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { resolveMediaUrl } from "../../utils/media";
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
  { id: 1, label: "Início", slug: "inicio", target: "/", is_dropdown: false, order: 1 },
  { id: 2, label: "Quem Somos", slug: "quem-somos", target: "/quem-somos", is_dropdown: false, order: 2 },
  { id: 3, label: "Projetos e Serviços", slug: "projetos-servicos", target: "/projetos", is_dropdown: true, order: 3 },
  { id: 4, label: "Notícias", slug: "noticias", target: "/noticias", is_dropdown: false, order: 4 },
  { id: 5, label: "Portfólio", slug: "portfolio", target: "/portfolio", is_dropdown: false, order: 5 },
  { id: 6, label: "Oportunidades", slug: "oportunidades", target: "/oportunidades", is_dropdown: false, order: 6 },
  { id: 7, label: "Doação", slug: "doacao", target: "/doacao", is_dropdown: false, order: 7 },
  { id: 8, label: "Contato", slug: "contato", target: "/contato", is_dropdown: false, order: 8 },
  // Children for Projetos e Serviços
  { id: 30, label: "Clubinho da Leitura", slug: "clubinho-da-leitura", target: "/pages/clubinho-da-leitura", is_dropdown: false, parent_id: 3, order: 1 },
  { id: 31, label: "Igualdade de Gênero", slug: "igualdade-de-genero", target: "/pages/igualdade-de-genero", is_dropdown: false, parent_id: 3, order: 2 },
  { id: 32, label: "Trilhas de Carreira", slug: "trilhas-de-carreira", target: "/pages/trilhas-de-carreira", is_dropdown: false, parent_id: 3, order: 3 },
  { id: 33, label: "Mentorias Profissionais", slug: "mentorias-profissionais", target: "/pages/mentorias-profissionais", is_dropdown: false, parent_id: 3, order: 4 },
  { id: 34, label: "Cursos / Serviços", slug: "cursos", target: "/pages/cursos", is_dropdown: false, parent_id: 3, order: 5 },
];

export const PublicLayout = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
   const [branding, setBranding] = useState<{ logo_url?: string }>({});
   const [footerInfo, setFooterInfo] = useState<{
     address?: string;
     email?: string;
     phone?: string;
     social?: Record<string, string>;
   }>({});
  const currentLang = (i18n.language || "pt").slice(0, 2);

  useEffect(() => {
    api
      .get("/menus")
      .then(({ data }) => setMenus(data.items || data))
      .catch(() => setMenus([]));
    api
      .get("/settings/site_branding")
      .then(({ data }) => setBranding(data.value || {}))
      .catch(() => setBranding({}));
    api
      .get("/settings/footer")
      .then(({ data }) => setFooterInfo(data.value || {}))
      .catch(() => setFooterInfo({}));
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuTree = useMemo(() => {
    const source = menus.length ? menus : fallbackNav;
    const parents = source.filter((m) => !m.parent_id);
    return parents
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((parent) => ({
        ...parent,
        children: source
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
          background: "#fff",
          color: "var(--text)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 15,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1.25rem",
            gap: "1rem",
          }}
        >
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "var(--primary-dark)",
              fontWeight: 800,
              letterSpacing: "0.5px",
            }}
          >
            {branding.logo_url ? (
              <img
                src={resolveMediaUrl(branding.logo_url)}
                alt="Instituto ABRAMS"
                style={{ height: 42, width: "auto", objectFit: "contain" }}
              />
            ) : (
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "#fff7eb",
                  color: "var(--primary)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                }}
              >
                A
              </div>
            )}
            Instituto ABRAMS
          </Link>

          <button
            className="btn btn-ghost"
            style={{
              display: isMobile ? "inline-flex" : "none",
              color: "var(--primary-dark)",
              background: "#fff",
              borderColor: "var(--border)",
              padding: "0.5rem 0.8rem",
              fontWeight: 700,
            }}
            onClick={() => setIsMenuOpen((s) => !s)}
          >
            Menu
          </button>

          <nav
            style={{
              display: isMobile ? (isMenuOpen ? "grid" : "none") : "flex",
              gap: "0.75rem",
              alignItems: "center",
              position: isMobile ? "absolute" : "relative",
              top: isMobile ? "100%" : "auto",
              left: 0,
              right: 0,
              background: isMobile ? "#fff" : "transparent",
              padding: isMobile ? "0.75rem 0" : 0,
              borderRadius: isMobile ? "0 0 12px 12px" : 0,
              boxShadow: isMobile ? "0 12px 24px rgba(0,0,0,0.08)" : "none",
            }}
          >
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
                        ? "rgba(207,175,112,0.18)"
                        : "transparent",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      color: isActive(item.target) ? "var(--primary-dark)" : "var(--text)",
                      transition: "background-color 120ms ease, color 120ms ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                    <span style={{ fontSize: 10 }}>▼</span>
                  </span>
                  <div
                    className="dropdown"
                    style={{
                      position: isMobile ? "relative" : "absolute",
                      top: isMobile ? "auto" : "110%",
                      left: 0,
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      color: "var(--text)",
                      borderRadius: 10,
                      minWidth: 200,
                      boxShadow: "0 14px 32px rgba(0,0,0,0.08)",
                      gap: "0.35rem",
                      padding: "0.6rem",
                      zIndex: 10,
                      display: isMobile ? "grid" : "none",
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
                    color: isActive(item.target) ? "var(--primary-dark)" : "var(--text)",
                    padding: "0.35rem 0.5rem",
                    borderRadius: 8,
                    background: isActive(item.target)
                      ? "rgba(207,175,112,0.18)"
                      : "transparent",
                    transition: "background-color 120ms ease, color 120ms ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <select
              className="lang-select"
              value={currentLang}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              style={{ padding: "0.4rem 0.75rem", fontWeight: 600 }}
            >
              <option value="pt">PT</option>
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
            </select>
            {isAuthenticated ? (
              <Link className="btn btn-ghost" to="/admin" style={{ color: "var(--primary-dark)" }}>
                Painel
              </Link>
            ) : (
              <Link className="btn btn-ghost" to="/admin/login" style={{ color: "var(--primary-dark)" }}>
                {t("common.admin")}
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
          padding: "2rem 0 1.25rem",
          marginTop: "2.5rem",
          background: "#f9fafb",
        }}
      >
        <div
          className="container"
          style={{ display: "grid", gap: "1.5rem" }}
        >
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div style={{ display: "grid", gap: "0.35rem" }}>
              <strong>Instituto ABRAMS</strong>
              <p style={{ margin: 0, color: "var(--muted)" }}>
                {footerInfo.address || "Construindo futuro com oportunidades e propósito."}
              </p>
              {footerInfo.email && <p style={{ margin: 0, color: "var(--muted)" }}>{footerInfo.email}</p>}
              {footerInfo.phone && <p style={{ margin: 0, color: "var(--muted)" }}>{footerInfo.phone}</p>}
            </div>
            <div style={{ display: "grid", gap: "0.35rem" }}>
              <strong>Links rápidos</strong>
              {[
                { label: "Home", href: "/" },
                { label: "Quem Somos", href: "/quem-somos" },
                { label: "Projetos", href: "/projetos" },
                { label: "Doação", href: "/doacao" },
                { label: "Contato", href: "/contato" },
              ].map((link) => (
                <Link key={link.href} to={link.href} style={{ color: "var(--muted)" }}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div style={{ display: "grid", gap: "0.35rem" }}>
              <strong>Redes sociais</strong>
              {footerInfo.social?.youtube && (
                <a href={footerInfo.social.youtube} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>
                  YouTube
                </a>
              )}
              {footerInfo.social?.instagram && (
                <a href={footerInfo.social.instagram} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>
                  Instagram
                </a>
              )}
              {footerInfo.social?.facebook && (
                <a href={footerInfo.social.facebook} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>
                  Facebook
                </a>
              )}
              {footerInfo.social?.linkedin && (
                <a href={footerInfo.social.linkedin} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>
                  LinkedIn
                </a>
              )}
              {!footerInfo.social && <p style={{ margin: 0, color: "var(--muted)" }}>Em breve novidades.</p>}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <small style={{ color: "#777" }}>© {new Date().getFullYear()} Instituto ABRAMS</small>
            <small style={{ color: "var(--muted)" }}>CNPJ: 00.000.000/0000-00</small>
          </div>
        </div>
      </footer>
    </div>
  );
};
