import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { api } from "../../services/api";
import { getLocalized } from "../../utils/content";

type Page = {
  slug: string;
  title_translations: Record<string, string>;
  content_translations: Record<string, string>;
};

export const PublicPage = () => {
  const { slug } = useParams();
  const { i18n, t } = useTranslation();
  const [page, setPage] = useState<Page | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .get(`/pages/slug/${slug}`)
      .then(({ data }) => {
        setPage(data);
        setNotFound(false);
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="container section">
        <h2>{t("common.notFound", { defaultValue: "Página não encontrada" })}</h2>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container section">
        <p>{t("common.loading", { defaultValue: "Carregando..." })}</p>
      </div>
    );
  }

  const title = getLocalized(page.title_translations, i18n.language);
  const content = getLocalized(page.content_translations, i18n.language);

  return (
    <div className="container section" style={{ display: "grid", gap: "1rem" }}>
      <h2>{title}</h2>
      <div className="divider" />
      <div
        style={{ color: "var(--muted)", lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: content || "" }}
      />
    </div>
  );
};
