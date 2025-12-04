import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { api } from "../../services/api";
import { getLocalized } from "../../utils/content";

type Page = {
  title_translations: Record<string, string>;
  content_translations: Record<string, string>;
};

export const QuemSomos = () => {
  const { i18n, t } = useTranslation();
  const [page, setPage] = useState<Page | null>(null);

  useEffect(() => {
    api
      .get("/pages/slug/quem-somos")
      .then(({ data }) => setPage(data))
      .catch(() => setPage(null));
  }, []);

  const title = page ? getLocalized(page.title_translations, i18n.language) : t("heroTitle");
  const content = page ? getLocalized(page.content_translations, i18n.language) : "";

  return (
    <div className="container section" style={{ display: "grid", gap: "1rem" }}>
      <h2>{title}</h2>
      <div className="divider" />
      <div
        className="card"
        style={{ background: "var(--surface)", lineHeight: 1.7 }}
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
