export const normalizeRichTextHtml = (html: string): string => {
  if (!html) return "";

  return html
    .replace(/(\s*<p><br><\/p>\s*){2,}/g, "<p><br></p>")
    .replace(/^(\s*<p><br><\/p>\s*)+/g, "")
    .replace(/(\s*<p><br><\/p>\s*)+$/g, "")
    .trim();
};
