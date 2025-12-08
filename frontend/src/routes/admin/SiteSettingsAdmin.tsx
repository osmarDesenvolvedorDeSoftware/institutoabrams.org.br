import { useEffect, useState } from "react";

import { ImagePlaceholder } from "../../components/media/ImagePlaceholder";
import { MediaButton } from "../../components/media/MediaButton";
import { api } from "../../services/api";

type Branding = {
  logo_url?: string;
  logo_dark_url?: string;
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
      await api.put("/settings/site_tracking", { value: tracking });
      setStatusMessage("Configurações de Analytics salvas com sucesso.");
    } catch (error) {
      setStatusMessage("Erro ao salvar configurações de Analytics.");
    } finally {
      setIsSavingTracking(false);
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
          <label style={{ fontWeight: 600 }}>Logo escura (opcional)</label>
          <ImagePlaceholder url={branding.logo_dark_url} label="Nenhuma logo" maxHeight={120} />
          <MediaButton
            value={branding.logo_dark_url}
            onChange={(url) => setBranding((prev) => ({ ...prev, logo_dark_url: url }))}
            label="Upload logo escura"
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
          onChange={(e) => setTracking((prev) => ({ ...prev, ga_id: e.target.value }))}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <input
          placeholder="Google Tag Manager ID (ex: GTM-XXXX)"
          value={tracking.gtm_id || ""}
          onChange={(e) => setTracking((prev) => ({ ...prev, gtm_id: e.target.value }))}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />

        <button className="btn btn-primary" type="button" onClick={saveTracking} disabled={isSavingTracking}>
          {isSavingTracking ? "Salvando..." : "Salvar Analytics"}
        </button>
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
