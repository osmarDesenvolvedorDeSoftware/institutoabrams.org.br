import { useRef, useState } from "react";

import { api } from "../../services/api";
import { MediaLibrary } from "./MediaLibrary";

type Props = {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
};

export const MediaButton = ({ value, onChange, label = "Upload imagem" }: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data?.url) {
        onChange(data.url);
      }
    } catch (error) {
      console.error("Falha no upload", error);
      alert("Falha no upload. Envie apenas imagens PNG/JPEG/WEBP.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "0.35rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button type="button" className="btn btn-secondary" onClick={() => setShowLibrary(true)}>
          Escolher da Biblioteca
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          style={{ opacity: isUploading ? 0.7 : 1 }}
        >
          {isUploading ? "Enviando..." : label}
        </button>
      </div>
      {value && <small style={{ color: "var(--muted)" }}>Arquivo atual: {value}</small>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {showLibrary && (
        <MediaLibrary
          onSelect={(url) => {
            onChange(url);
            setShowLibrary(false);
          }}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
};
