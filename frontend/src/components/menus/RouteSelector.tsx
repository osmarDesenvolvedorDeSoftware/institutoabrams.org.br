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
          { label: "Início", value: "/" },
          { label: "Quem Somos", value: "/quem-somos" },
          { label: "Notícias", value: "/noticias" },
          { label: "Portfólio", value: "/portfolio" },
          { label: "Doação", value: "/doacao" },
          { label: "Contato", value: "/contato" },
        ],
      },
      {
        label: "Projetos e Serviços",
        routes: [
          { label: "Projetos", value: "/projetos" },
          { label: "Clubinho da Leitura", value: "/pages/clubinho-da-leitura" },
          { label: "Igualdade de Gênero", value: "/pages/igualdade-de-genero" },
          { label: "Trilhas de Carreira", value: "/pages/trilhas-de-carreira" },
          { label: "Mentorias Profissionais", value: "/pages/mentorias-profissionais" },
          { label: "Cursos / Serviços", value: "/pages/cursos" },
        ],
      },
      {
        label: "Oportunidades",
        routes: [{ label: "Oportunidades", value: "/oportunidades" }],
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
