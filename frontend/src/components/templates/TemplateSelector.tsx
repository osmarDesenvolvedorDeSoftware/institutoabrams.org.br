import { useEffect, useState } from "react";

import { api } from "../../services/api";

type Template = {
  id: string;
  name: string;
  description: string;
  category: string | null;
  icon?: string;
  content: string;
};

type TemplateSelectorProps = {
  onSelect: (template: Template) => void;
  selectedId?: string;
};

export const TemplateSelector = ({ onSelect, selectedId }: TemplateSelectorProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await api.get("/pages/page-templates");
        setTemplates(data.templates || []);
      } catch (error) {
        console.error("Erro ao carregar templates:", error);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
        Carregando templates...
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          background: "var(--warning-bg, #fef3c7)",
          borderRadius: 8,
          color: "var(--warning, #d97706)",
        }}
      >
        Nenhum template disponível no momento.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Escolha um Template</h4>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9em" }}>
          Selecione um modelo pronto para começar mais rápido
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            style={{
              padding: "1.25rem",
              textAlign: "left",
              cursor: "pointer",
              border: selectedId === template.id ? "2px solid var(--primary)" : "1px solid var(--border)",
              borderRadius: 10,
              background: selectedId === template.id ? "var(--primary-bg, #eff6ff)" : "var(--card-bg, white)",
              transition: "all 0.2s ease",
              display: "grid",
              gap: "0.5rem",
            }}
            onMouseEnter={(event) => {
              if (selectedId !== template.id) {
                event.currentTarget.style.borderColor = "var(--primary)";
                event.currentTarget.style.transform = "translateY(-2px)";
                event.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }
            }}
            onMouseLeave={(event) => {
              if (selectedId !== template.id) {
                event.currentTarget.style.borderColor = "var(--border)";
                event.currentTarget.style.transform = "translateY(0)";
                event.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {template.icon ? <div style={{ fontSize: "2em", lineHeight: 1 }}>{template.icon}</div> : null}
            <div>
              <strong style={{ display: "block", marginBottom: "0.25rem" }}>{template.name}</strong>
              <small style={{ color: "var(--muted)", fontSize: "0.85em" }}>{template.description}</small>
            </div>
            {template.category && (
              <span
                style={{
                  display: "inline-block",
                  padding: "0.25rem 0.5rem",
                  background: "var(--muted-bg, #f3f4f6)",
                  borderRadius: 4,
                  fontSize: "0.75em",
                  color: "var(--muted)",
                }}
              >
                {template.category}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
