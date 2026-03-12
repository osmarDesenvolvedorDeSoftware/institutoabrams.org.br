export const normalizeRichTextHtml = (html: string): string => {
  if (!html) return "";

  const emptyParagraphPattern = /<p>(?:\s|&nbsp;|&#160;|<br\s*\/?>)*<\/p>/gi;

  return html
    .replace(emptyParagraphPattern, "")
    .replace(/(?:\s|&nbsp;|&#160;)+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
};
