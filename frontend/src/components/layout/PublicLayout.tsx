import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { resolveMediaUrl } from "../../utils/media";
import { api } from "../../services/api";
import facebookIcon from "../../assets/paidin/footer/facebook.svg";
import instagramIcon from "../../assets/paidin/footer/instagram.svg";

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
    });
    return links;
  }, [menuTree]);

  const socialLinks = useMemo(
    () => [
      { key: "youtube", label: "YouTube", href: footerInfo.social?.youtube },
      { key: "instagram", label: "Instagram", href: footerInfo.social?.instagram },
      { key: "facebook", label: "Facebook", href: footerInfo.social?.facebook },
      { key: "linkedin", label: "LinkedIn", href: footerInfo.social?.linkedin },
    ],
    [footerInfo.social],
  );

  const hasSocialLinks = socialLinks.some((link) => Boolean(link.href));

  const socialIconMap: Record<string, string> = {
    facebook: facebookIcon,
    instagram: instagramIcon,
  };

  const renderSocialIcon = (key: string) => {
    const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true };
    if (key === "youtube") {
      return (
        <svg {...common}>
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-5.8zM9.6 15.5V8.5l6.2 3.5-6.2 3.5z" />
        </svg>
      );
    }
    if (key === "instagram") {
      return (
        <svg {...common}>
          <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7zm10 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      );
    }
    if (key === "facebook") {
      return (
        <svg {...common}>
          <path d="M13 3h4v4h-2c-.6 0-1 .4-1 1v3h3l-.5 4H14v6h-4v-6H8v-4h2V8a5 5 0 0 1 5-5z" />
        </svg>
      );
    }
    if (key === "linkedin") {
      return (
        <svg {...common}>
          <path d="M4 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm-2 7h4v11H2V10zm7 0h4v1.6c.6-1 1.8-2 3.6-2 3 0 5.4 2 5.4 6.3V21h-4v-4.7c0-2-1-3.3-2.7-3.3-1.5 0-2.3 1-2.7 1.9-.1.3-.2.7-.2 1.2V21H9V10z" />
        </svg>
      );
    }
    return null;
  };

  const isActive = (target: string) => pathname === target || pathname.startsWith(target + "/");

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="brand">
            {branding.logo_url ? (
              <img
                src={resolveMediaUrl(branding.logo_url)}
                alt="Instituto ABRAMS"
                style={{ height: 40, width: "auto", objectFit: "contain" }}
              />
            ) : (
              <div className="brand-mark">A</div>
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
            className="site-nav"
            style={{
              display: isMobile ? (isMenuOpen ? "grid" : "none") : "flex",
              position: isMobile ? "absolute" : "relative",
              top: isMobile ? "100%" : "auto",
              left: 0,
              right: 0,
              background: isMobile ? "#fff" : "transparent",
              padding: isMobile ? "0.75rem 0" : 0,
              borderRadius: isMobile ? "0 0 12px 12px" : 0,
              boxShadow: isMobile ? "0 12px 24px rgba(0,0,0,0.08)" : "none",
              gap: isMobile ? "0.35rem" : undefined,
              justifyContent: isMobile ? "center" : undefined,
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
                  <span className={`nav-pill ${isActive(item.target) ? "active" : ""}`}>
                    {item.label}
                    <span style={{ fontSize: 10 }}>v</span>
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
                <Link key={item.id} to={item.target} className={`nav-pill ${isActive(item.target) ? "active" : ""}`}>
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
              <Link className="nav-cta" to="/admin">
                {t("common.adminPanel", { defaultValue: "Painel" })}
              </Link>
            ) : (
              <Link className="nav-cta" to="/admin/login">
                {t("common.admin")}
              </Link>
            )}
          </div>
        </div>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container" style={{ display: "grid", gap: "1.5rem" }}>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <div className="footer-card" style={{ display: "grid", gap: "0.35rem" }}>
              <strong className="footer-title">Instituto ABRAMS</strong>
              <p style={{ margin: 0, color: "var(--muted)" }}>
                {footerInfo.address ||
                  t("footer.defaultDescription", {
                    defaultValue: "Construindo futuro com oportunidades e proposito.",
                  })}
              </p>
              {footerInfo.email && <p style={{ margin: 0, color: "var(--muted)" }}>{footerInfo.email}</p>}
              {footerInfo.phone && <p style={{ margin: 0, color: "var(--muted)" }}>{footerInfo.phone}</p>}
            </div>
            <div className="footer-card" style={{ display: "grid", gap: "0.35rem" }}>
              <strong className="footer-title">{t("footer.quickLinks", { defaultValue: "Links" })}</strong>
              {footerLinks.length ? (
                footerLinks.map((link) => (
                  <Link key={link.target} to={link.target} className="footer-link">
                    {link.label}
                  </Link>
                ))
              ) : (
                <p style={{ margin: 0, color: "var(--muted)" }}>Nenhum link de menu configurado.</p>
              )}
            </div>
            <div className="footer-card" style={{ display: "grid", gap: "0.35rem" }}>
              <strong className="footer-title">{t("footer.social", { defaultValue: "Redes sociais" })}</strong>
              {socialLinks.map((link) =>
                link.href ? (
                  <a key={link.key} href={link.href} target="_blank" rel="noreferrer" className="footer-link">
                    {socialIconMap[link.key] ? (
                      <img src={socialIconMap[link.key]} alt="" className="footer-icon" />
                    ) : (
                      renderSocialIcon(link.key)
                    )}
                    {link.label}
                  </a>
                ) : null,
              )}
              {!hasSocialLinks && (
                <p style={{ margin: 0, color: "var(--muted)" }}>
                  {t("footer.comingSoon", { defaultValue: "Em breve novidades." })}
                </p>
              )}
            </div>
          </div>
          <div className="footer-meta">
            <small style={{ color: "#777" }}>(c) {new Date().getFullYear()} Instituto ABRAMS</small>
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
