import { Helmet } from "react-helmet";

import { DEFAULT_DESCRIPTION, DEFAULT_IMAGE, DEFAULT_TITLE } from "../../utils/seoDefaults";
import { resolveMediaUrl } from "../../utils/media";

type Props = {
  title?: string;
  description?: string;
  image?: string | null;
  url?: string;
};

export const SeoHelmet = ({ title, description, image, url }: Props) => {
  const finalTitle = title || DEFAULT_TITLE;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalImage = resolveMediaUrl(image || DEFAULT_IMAGE);

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      {url && <meta property="og:url" content={url} />}
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
};

export default SeoHelmet;
