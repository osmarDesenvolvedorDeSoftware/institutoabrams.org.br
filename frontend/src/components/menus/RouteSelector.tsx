import { useMemo } from "react";

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

export const RouteSelector = ({ value, onChange, pages = [] }: Props) => {
  const pageOptions = useMemo(
    () =>
      pages.map((page) => ({
        label: page.title_translations?.pt || page.slug,
        value: `/pages/${page.slug}`,
      })),
    [pages],
  );

  const allowedValues = useMemo(() => {
    const defaults = fixedRoutes.map((r) => r.value);
    const pagesValues = pageOptions.map((p) => p.value);
    return [...defaults, ...pagesValues];
  }, [pageOptions]);

  const currentValue =
    value && !allowedValues.includes(value) ? "__unsupported__" : value;

  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <select
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid var(--border)" }}
      >
        <option value="">Selecione a rota</option>
        {currentValue === "__unsupported__" && (
          <option value="__unsupported__" disabled>
            Rota atual (não listada): {value}
          </option>
        )}
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
      </select>
    </div>
  );
};
