import { useEffect, useState } from "react";

import { ImagePlaceholder } from "../../components/media/ImagePlaceholder";
import { MediaButton } from "../../components/media/MediaButton";
import { api } from "../../services/api";

type Branding = {
  logo_url?: string;
  favicon_url?: string;
};

type Footer = {
  address?: string;
  email?: string;
  phone?: string;
  cnpj?: string;
  social?: {
    youtube?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
};

type Tracking = {
  ga_id?: string;
  gtm_id?: string;
};

export const SiteSettingsAdmin = () => {
  const [branding, setBranding] = useState<Branding>({});
  const [footer, setFooter] = useState<Footer>({ social: {} });
  const [tracking, setTracking] = useState<Tracking>({});
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [isSavingFooter, setIsSavingFooter] = useState(false);
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<string | null>(null);
  const formatError = tracking.gtm_id
    ? /^GTM-[A-Z0-9]{6,}$/i.test(tracking.gtm_id.trim())
      ? null
      : "Formato inválido. Use o GTM-XXXXXX."
    : tracking.ga_id
      ? /^G-[A-Z0-9]{8,}$/i.test(tracking.ga_id.trim())
        ? null
        : "Formato inválido. Use o Measurement ID (G-XXXXXXXX)."
      : null;

  const fetchSettings = async () => {
    try {
      const [{ data: brandResp }, { data: footerResp }, { data: trackingResp }] = await Promise.all([
        api.get("/settings/site_branding"),
        api.get("/settings/footer"),
        api.get("/settings/site_tracking"),
      ]);
      setBranding(brandResp.value || {});
      setFooter(footerResp.value || { social: {} });
      setTracking(trackingResp.value || {});
    } catch (error) {
      console.error("Erro ao carregar configurações", error);
      setStatusMessage("Erro ao carregar configurações.");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveBranding = async () => {
    setIsSavingBranding(true);
    try {
      await api.put("/settings/site_branding", { value: branding });
      setStatusMessage("Identidade visual salva com sucesso.");
    } catch (error) {
      setStatusMessage("Erro ao salvar identidade visual.");
    } finally {
      setIsSavingBranding(false);
    }
  };

  const saveFooter = async () => {
    setIsSavingFooter(true);
    try {
      await api.put("/settings/footer", { value: footer });
      setStatusMessage("Rodapé salvo com sucesso.");
    } catch (error) {
      setStatusMessage("Erro ao salvar rodapé.");
    } finally {
      setIsSavingFooter(false);
    }
  };

  const saveTracking = async () => {
    setIsSavingTracking(true);
    try {
      const isValid = await validateTracking();
      if (!isValid) {
        return;
      }
      const payload: Tracking = tracking.gtm_id
        ? { gtm_id: tracking.gtm_id, ga_id: "" }
        : { ga_id: tracking.ga_id, gtm_id: "" };
      await api.put("/settings/site_tracking", { value: payload });
      setStatusMessage("Configurações de Analytics salvas com sucesso.");
      setTracking((prev) => ({
        ga_id: payload.ga_id || "",
        gtm_id: payload.gtm_id || "",
      }));
      setTrackingStatus(null);
    } catch (error) {
      setStatusMessage("Erro ao salvar configurações de Analytics.");
    } finally {
      setIsSavingTracking(false);
    }
  };

  const validateTracking = async (): Promise<boolean> => {
    setTrackingStatus(null);
    if (tracking.gtm_id) {
      const gtmId = tracking.gtm_id.trim();
      if (!/^GTM-[A-Z0-9]{6,}$/i.test(gtmId)) {
        setTrackingStatus("Formato inválido. Use o GTM-XXXXXX.");
        return false;
      }
      try {
        const existing = document.getElementById("gtm-validate-script");
        if (!existing) {
          const script = document.createElement("script");
          script.id = "gtm-validate-script";
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
          document.head.appendChild(script);
        }
        await new Promise<void>((resolve, reject) => {
          const timer = window.setTimeout(() => reject(new Error("timeout")), 3000);
          const poll = window.setInterval(() => {
            const w = window as any;
            if (w.dataLayer) {
              window.clearTimeout(timer);
              window.clearInterval(poll);
              resolve();
            }
          }, 150);
        });
        setTrackingStatus("GTM carregado com sucesso (validação silenciosa).");
        return true;
      } catch (error) {
        setTrackingStatus("Não foi possível validar o GTM. Verifique o ID e a conexão.");
        return false;
      }
    }
    const gaId = tracking.ga_id?.trim();
    if (!gaId) {
      setTrackingStatus("Preencha o Measurement ID (G-XXXXXXXX).");
      return false;
    }
    if (!/^G-[A-Z0-9]{8,}$/i.test(gaId)) {
      setTrackingStatus("Formato inválido. Use o Measurement ID (G-XXXXXXXX).");
      return false;
    }
    try {
      const existing = document.getElementById("ga-validate-script");
      if (!existing) {
        const script = document.createElement("script");
        script.id = "ga-validate-script";
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);
      }
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error("timeout")), 3000);
          const poll = window.setInterval(() => {
            const w = window as any;
            if (w.gtag) {
              window.clearTimeout(timer);
              window.clearInterval(poll);
              resolve();
            }
          }, 150);
        });
      setTrackingStatus("GA carregado com sucesso (validação silenciosa).");
      return true;
    } catch (error) {
      setTrackingStatus("Não foi possível validar o GA. Verifique o ID e a conexão.");
      return false;
    }
  };

  return (
    <div className="grid two" style={{ alignItems: "start", gap: "1.25rem" }}>
      <div className="card" style={{ display: "grid", gap: "0.85rem" }}>
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
            <p style={{ margin: 0, color: "var(--muted)" }}>Configurações do site</p>
            <h3 style={{ margin: "0.2rem 0 0" }}>Identidade Visual</h3>
          </div>
        </div>

        <div style={{ display: "grid", gap: "0.65rem" }}>
          <label style={{ fontWeight: 600 }}>Logo principal</label>
          <ImagePlaceholder url={branding.logo_url} label="Nenhuma logo" maxHeight={120} />
          <MediaButton
            value={branding.logo_url}
            onChange={(url) => setBranding((prev) => ({ ...prev, logo_url: url }))}
            label="Upload logo"
          />
        </div>

        <div style={{ display: "grid", gap: "0.65rem" }}>
          <label style={{ fontWeight: 600 }}>Favicon (opcional)</label>
          <ImagePlaceholder url={branding.favicon_url} label="Nenhum favicon" maxHeight={80} />
          <MediaButton
            value={branding.favicon_url}
            onChange={(url) => setBranding((prev) => ({ ...prev, favicon_url: url }))}
            label="Upload favicon"
          />
        </div>

        <button className="btn btn-primary" type="button" onClick={saveBranding} disabled={isSavingBranding}>
          {isSavingBranding ? "Salvando..." : "Salvar identidade visual"}
        </button>
      </div>

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
            <p style={{ margin: 0, color: "var(--muted)" }}>Configurações do site</p>
            <h3 style={{ margin: "0.2rem 0 0" }}>Rodapé / Contatos</h3>
          </div>
        </div>

        <input
          placeholder="Endereço"
          value={footer.address || ""}
          onChange={(e) => setFooter((prev) => ({ ...prev, address: e.target.value }))}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <input
          placeholder="E-mail"
          value={footer.email || ""}
          onChange={(e) => setFooter((prev) => ({ ...prev, email: e.target.value }))}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <input
          placeholder="Telefone"
          value={footer.phone || ""}
          onChange={(e) => setFooter((prev) => ({ ...prev, phone: e.target.value }))}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <input
          placeholder="CNPJ"
          value={footer.cnpj || ""}
          onChange={(e) => setFooter((prev) => ({ ...prev, cnpj: e.target.value }))}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />

        <div style={{ display: "grid", gap: "0.35rem" }}>
          <label style={{ fontWeight: 600 }}>Redes sociais</label>
          <input
            placeholder="YouTube"
            value={footer.social?.youtube || ""}
            onChange={(e) =>
              setFooter((prev) => ({ ...prev, social: { ...prev.social, youtube: e.target.value } }))
            }
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
          <input
            placeholder="Instagram"
            value={footer.social?.instagram || ""}
            onChange={(e) =>
              setFooter((prev) => ({ ...prev, social: { ...prev.social, instagram: e.target.value } }))
            }
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
          <input
            placeholder="Facebook"
            value={footer.social?.facebook || ""}
            onChange={(e) =>
              setFooter((prev) => ({ ...prev, social: { ...prev.social, facebook: e.target.value } }))
            }
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
          <input
            placeholder="LinkedIn"
            value={footer.social?.linkedin || ""}
            onChange={(e) =>
              setFooter((prev) => ({ ...prev, social: { ...prev.social, linkedin: e.target.value } }))
            }
            style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
          />
        </div>

        <button className="btn btn-primary" type="button" onClick={saveFooter} disabled={isSavingFooter}>
          {isSavingFooter ? "Salvando..." : "Salvar rodapé"}
        </button>
      </div>

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
            <p style={{ margin: 0, color: "var(--muted)" }}>Configurações do site</p>
            <h3 style={{ margin: "0.2rem 0 0" }}>Analytics e Tag Manager</h3>
          </div>
        </div>

        <input
          placeholder="Google Analytics Measurement ID (ex: G-XXXX)"
          value={tracking.ga_id || ""}
          onChange={(e) => setTracking((prev) => ({ ...prev, ga_id: e.target.value, gtm_id: "" }))}
          disabled={Boolean(tracking.gtm_id)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <input
          placeholder="Google Tag Manager ID (ex: GTM-XXXX)"
          value={tracking.gtm_id || ""}
          onChange={(e) => setTracking((prev) => ({ ...prev, gtm_id: e.target.value, ga_id: "" }))}
          disabled={Boolean(tracking.ga_id)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <small style={{ color: "var(--muted)" }}>
          Ativo: {tracking.gtm_id ? "GTM" : tracking.ga_id ? "GA" : "nenhum"} (apenas um por vez)
        </small>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button className="btn btn-ghost" type="button" onClick={validateTracking}>
            Validar
          </button>
          <button className="btn btn-primary" type="button" onClick={saveTracking} disabled={isSavingTracking}>
            {isSavingTracking ? "Salvando..." : "Salvar Analytics"}
          </button>
        </div>
        {formatError && <small style={{ color: "tomato" }}>{formatError}</small>}
        {!formatError && trackingStatus && <small style={{ color: "var(--muted)" }}>{trackingStatus}</small>}
      </div>

      {statusMessage && (
        <div className="card" style={{ display: "grid", gap: "0.25rem", background: "#f9fafb" }}>
          <strong>Status</strong>
          <p style={{ margin: 0, color: "var(--muted)" }}>{statusMessage}</p>
        </div>
      )}
    </div>
  );
};
