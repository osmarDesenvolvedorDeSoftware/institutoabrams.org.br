import { useEffect, useMemo, useState } from "react";

type Page = {
  slug: string;
  title_translations: Record<string, string>;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  pages?: Page[];
};

const fixedRoutes = [
  { label: "Home", value: "/" },
  { label: "Projetos", value: "/projetos" },
  { label: "Oportunidades", value: "/oportunidades" },
  { label: "Contato", value: "/contato" },
];

const CUSTOM_VALUE = "__custom__";

export const RouteSelector = ({ value, onChange, pages = [] }: Props) => {
  const pageOptions = useMemo(
    () =>
      pages.map((page) => ({
        label: page.title_translations?.pt || page.slug,
        value: `/pages/${page.slug}`,
      })),
    [pages],
  );

  const allowedValues = useMemo(
    () => [...fixedRoutes.map((r) => r.value), ...pageOptions.map((p) => p.value)],
    [pageOptions],
  );

  const isCustom = value ? !allowedValues.includes(value) : false;
  const [customValue, setCustomValue] = useState<string>(isCustom ? value : "");

  useEffect(() => {
    // Keep custom input in sync when parent value changes externally
    if (!allowedValues.includes(value)) {
      setCustomValue(value);
    }
  }, [value, allowedValues]);

  const currentSelectValue = isCustom ? CUSTOM_VALUE : value;

  const handleSelectChange = (selected: string) => {
    if (selected === CUSTOM_VALUE) {
      // Keep previous custom value or empty while showing the input
      onChange(customValue || "");
      return;
    }
    onChange(selected);
  };

  const handleCustomChange = (next: string) => {
    setCustomValue(next);
    onChange(next);
  };

  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <select
        value={currentSelectValue}
        onChange={(e) => handleSelectChange(e.target.value)}
        style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
      >
        <option value="">Selecione a rota</option>
        <optgroup label="Páginas principais">
          {fixedRoutes.map((route) => (
            <option key={route.value} value={route.value}>
              {route.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Páginas do site">
          {pageOptions.map((page) => (
            <option key={page.value} value={page.value}>
              {page.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Personalizado">
          <option value={CUSTOM_VALUE}>Inserir rota manualmente</option>
        </optgroup>
      </select>

      {currentSelectValue === CUSTOM_VALUE && (
        <input
          placeholder="Rota personalizada (ex: /sobre)"
          value={customValue}
          onChange={(e) => handleCustomChange(e.target.value)}
          style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
        />
      )}
    </div>
  );
};
