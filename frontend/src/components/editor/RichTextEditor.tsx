import type { ChangeEvent } from "react";
import { useCallback, useMemo, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { api } from "../../services/api";
import { normalizeRichTextHtml } from "../../utils/html";
import { getYoutubeEmbedUrl, normalizeYoutubeEmbeds, resolveMediaUrl } from "../../utils/media";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const RichTextEditor = ({ value, onChange }: Props) => {
  const quillRef = useRef<ReactQuill | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const normalizedValue = useMemo(
    () => normalizeRichTextHtml(normalizeYoutubeEmbeds(value)),
    [value],
  );

  const handleImageClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleVideoClick = useCallback(() => {
    const url = window.prompt("Cole a URL do YouTube:");
    if (!url || !quillRef.current) return;
    const embedUrl = getYoutubeEmbedUrl(url) || url;
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    const insertAt = range?.index ?? editor.getLength();
    editor.insertEmbed(insertAt, "video", embedUrl, "user");
    editor.setSelection(insertAt + 1);
  }, []);

  const handleImageSelected = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = data?.url as string | undefined;
      if (!url || !quillRef.current) return;
      const displayUrl = resolveMediaUrl(url);
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      const insertAt = range?.index ?? editor.getLength();
      editor.insertEmbed(insertAt, "image", displayUrl, "user");
      editor.setSelection(insertAt + 1);
    } catch (error) {
      alert("Falha no upload. Envie apenas imagens PNG/JPEG/WEBP.");
    } finally {
      event.target.value = "";
    }
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          [{ size: [] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: handleImageClick,
          video: handleVideoClick,
        },
      },
    }),
    [handleImageClick, handleVideoClick],
  );

  const handleChange = useCallback(
    (html: string) => {
      onChange(normalizeRichTextHtml(normalizeYoutubeEmbeds(html)));
    },
    [onChange],
  );

  return (
    <>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={normalizedValue}
        onChange={handleChange}
        modules={modules}
        formats={[
          "header",
          "size",
          "bold",
          "italic",
          "underline",
          "strike",
          "color",
          "background",
          "align",
          "list",
          "bullet",
          "link",
          "image",
          "video",
        ]}
        placeholder="Digite o conteǧdo..."
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageSelected}
      />
    </>
  );
};
