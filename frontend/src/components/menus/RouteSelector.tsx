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

export const RouteSelector = ({ value, onChange, pages = [] }: Props) => {
  const pageOptions = useMemo(
    () =>
      pages.map((page) => ({
        label: page.title_translations?.pt || page.slug,
        value: `/pages/${page.slug}`,
      })),
    [pages],
  );

  const groupedRoutes = useMemo(
    () => [
      {
        label: "Institucional",
        routes: [
          { label: "Inicio", value: "/" },
          { label: "Quem Somos", value: "/pages/quem-somos" },
          { label: "Noticias", value: "/pages/noticias" },
          { label: "Portfolio", value: "/pages/portfolio" },
          { label: "Doacao", value: "/pages/doacao" },
          { label: "Contato", value: "/pages/contato" },
        ],
      },
      {
        label: "Projetos e Servicos",
        routes: [
          { label: "Projetos", value: "/pages/projetos" },
          { label: "Clubinho da Leitura", value: "/pages/clubinho-da-leitura" },
          { label: "Igualdade de Genero", value: "/pages/igualdade-de-genero" },
          { label: "Trilhas de Carreira", value: "/pages/trilhas-de-carreira" },
          { label: "Mentorias Profissionais", value: "/pages/mentorias-profissionais" },
          { label: "Cursos / Servicos", value: "/pages/cursos" },
        ],
      },
      {
        label: "Outros",
        routes: [],
      },
    ],
    [],
  );

  const allowedValues = useMemo(() => {
    const defaults = groupedRoutes.flatMap((g) => g.routes.map((r) => r.value));
    const pagesValues = pageOptions.map((p) => p.value);
    return [...defaults, ...pagesValues];
  }, [groupedRoutes, pageOptions]);

  const currentValue = value && !allowedValues.includes(value) ? "__unsupported__" : value;

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
            Rota atual (nao listada): {value}
          </option>
        )}
        {groupedRoutes.map((group) =>
          group.routes.length ? (
            <optgroup key={group.label} label={group.label}>
              {group.routes.map((route) => (
                <option key={route.value} value={route.value}>
                  {route.label}
                </option>
              ))}
            </optgroup>
          ) : null,
        )}
        <optgroup label="Paginas do site">
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
