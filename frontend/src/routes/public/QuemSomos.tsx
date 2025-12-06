import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { api } from "../../services/api";
import { getLocalized } from "../../utils/content";

type Page = {
  title_translations: Record<string, string>;
  content_translations: Record<string, string>;
  hero_image_url?: string | null;
};

export const QuemSomos = () => {
  const { i18n, t } = useTranslation();
  const [page, setPage] = useState<Page | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/pages/slug/quem-somos");
        setPage(data);
        return;
      } catch {
        // If slug not found, try first published page from category institucional
      }
      try {
        const { data } = await api.get("/pages", { params: { category: "institucional", is_published: true, per_page: 1 } });
        const items = data.items || data;
        setPage(items?.[0] || null);
      } catch {
        setPage(null);
      }
    };

    load();
  }, []);

  const title = page ? getLocalized(page.title_translations, i18n.language) : t("heroTitle");
  const content = page ? getLocalized(page.content_translations, i18n.language) : "";

  return (
    <div className="container section" style={{ display: "grid", gap: "1.25rem" }}>
      {page?.hero_image_url && (
        <img
          src={page.hero_image_url}
          alt={title}
          style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 14 }}
        />
      )}
      <h2 style={{ margin: 0, marginBottom: "0.35rem" }}>{title}</h2>
      <div className="divider" />
      <div
        className="card"
        style={{ background: "#fff", lineHeight: 1.7, padding: "1.35rem", borderRadius: 14 }}
        dangerouslySetInnerHTML={{
          __html:
            content ||
            t("projectPlaceholder", {
              defaultValue:
                "Conteúdo institucional do Instituto ABRAMS. Edite esta página no CMS para atualizar.",
            }),
        }}
      />
    </div>
  );
};
