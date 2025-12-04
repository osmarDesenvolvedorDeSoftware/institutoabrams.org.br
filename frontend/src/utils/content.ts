export const getLocalized = (
  translations: Record<string, string> = {},
  lang: string,
): string | undefined => {
  const key = lang.slice(0, 2);
  return translations[key] || translations["pt"] || translations["en"] || "";
};
