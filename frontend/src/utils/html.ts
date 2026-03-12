export const normalizeRichTextHtml = (html: string): string => {
  if (!html) return "";

  const emptyParagraphPattern = /<p>(?:\s|&nbsp;|&#160;|<br\s*\/?>)*<\/p>/gi;

  return html
    .replace(new RegExp(`(\\s*${emptyParagraphPattern.source}\\s*){2,}`, "gi"), "<p><br></p>")
    .replace(new RegExp(`^(\\s*${emptyParagraphPattern.source}\\s*)+`, "gi"), "")
    .replace(new RegExp(`(\\s*${emptyParagraphPattern.source}\\s*)+$`, "gi"), "")
    .trim();
};
