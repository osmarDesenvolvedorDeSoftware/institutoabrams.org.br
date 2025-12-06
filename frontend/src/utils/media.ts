export const getYoutubeEmbedUrl = (url?: string | null): string | null => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const paths = parsed.pathname.split("/");
      const embedIndex = paths.indexOf("embed");
      if (embedIndex !== -1 && paths[embedIndex + 1]) {
        return `https://www.youtube.com/embed/${paths[embedIndex + 1]}`;
      }
    }
  } catch (e) {
    return null;
  }
  return null;
};
