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
    cnpj?: string;
    social?: Record<string, string>;
  }>({});
  const [tracking, setTracking] = useState<{ ga_id?: string; gtm_id?: string }>({});
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
    api
      .get("/settings/site_tracking")
      .then(({ data }) => setTracking(data.value || {}))
      .catch(() => setTracking({}));
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const injectGTM = (id: string) => {
      if (!id) return;
      if (document.getElementById("gtm-script")) return;
      const script = document.createElement("script");
      script.id = "gtm-script";
      script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${id}');`;
      document.head.appendChild(script);

      if (!document.getElementById("gtm-noscript")) {
        const noscript = document.createElement("noscript");
        noscript.id = "gtm-noscript";
        noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.insertBefore(noscript, document.body.firstChild);
      }
    };

    const injectGA = (id: string) => {
      if (!id) return;
      if (document.getElementById("ga-script")) return;
      const script = document.createElement("script");
      script.id = "ga-script";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(script);

      const inline = document.createElement("script");
      inline.id = "ga-inline";
      inline.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${id}', { send_page_view: false });
      `;
      document.head.appendChild(inline);
    };

    if (tracking.gtm_id) {
      injectGTM(tracking.gtm_id);
    } else if (tracking.ga_id) {
      injectGA(tracking.ga_id);
    }
  }, [tracking]);

  useEffect(() => {
    const path = pathname;
    const w = window as any;
    if ((tracking.ga_id || tracking.gtm_id) && w.dataLayer) {
      w.dataLayer.push({ event: "pageview", page_path: path });
    }
    if (tracking.ga_id && w.gtag) {
      w.gtag("event", "page_view", { page_path: path });
    }
  }, [pathname, tracking.ga_id, tracking.gtm_id]);

  const menuTree = useMemo(() => {
    const source = menus;
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

  const footerLinks = useMemo(() => {
    const links: { label: string; target: string }[] = [];
    menuTree.forEach((parent) => {
      if (parent.target && parent.target !== "/") {
        links.push({ label: parent.label, target: parent.target });
      }
      (parent.children || []).forEach((child) => {
        if (child.target && child.target !== "/") {
          links.push({ label: child.label, target: child.target });
        }
      });
    });
    return links;
  }, [menuTree]);

  const isActive = (target: string) => pathname === target || pathname.startsWith(target + "/");

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
            {t("common.menu", { defaultValue: "Menu" })}
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
                      background: isActive(item.target) ? "rgba(207,175,112,0.18)" : "transparent",
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
                          background: isActive(child.target) ? "rgba(196,153,23,0.15)" : "transparent",
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
                    background: isActive(item.target) ? "rgba(207,175,112,0.18)" : "transparent",
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
                {t("common.adminPanel", { defaultValue: "Painel" })}
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
        <div className="container" style={{ display: "grid", gap: "1.5rem" }}>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div style={{ display: "grid", gap: "0.35rem" }}>
              <strong>Instituto ABRAMS</strong>
              <p style={{ margin: 0, color: "var(--muted)" }}>
                {footerInfo.address ||
                  t("footer.defaultDescription", {
                    defaultValue: "Construindo futuro com oportunidades e proposito.",
                  })}
              </p>
              {footerInfo.email && <p style={{ margin: 0, color: "var(--muted)" }}>{footerInfo.email}</p>}
              {footerInfo.phone && <p style={{ margin: 0, color: "var(--muted)" }}>{footerInfo.phone}</p>}
            </div>
            <div style={{ display: "grid", gap: "0.35rem" }}>
              <strong>{t("footer.quickLinks", { defaultValue: "Links" })}</strong>
              {footerLinks.length ? (
                footerLinks.map((link) => (
                  <Link key={link.target} to={link.target} style={{ color: "var(--muted)" }}>
                    {link.label}
                  </Link>
                ))
              ) : (
                <p style={{ margin: 0, color: "var(--muted)" }}>Nenhum link de menu configurado.</p>
              )}
            </div>
            <div style={{ display: "grid", gap: "0.35rem" }}>
              <strong>{t("footer.social", { defaultValue: "Redes sociais" })}</strong>
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
              {!footerInfo.social && (
                <p style={{ margin: 0, color: "var(--muted)" }}>
                  {t("footer.comingSoon", { defaultValue: "Em breve novidades." })}
                </p>
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <small style={{ color: "#777" }}>© {new Date().getFullYear()} Instituto ABRAMS</small>
            {footerInfo.cnpj && (
              <small style={{ color: "var(--muted)" }}>
                {t("footer.cnpjLabel", { defaultValue: "CNPJ" })}: {footerInfo.cnpj}
              </small>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
