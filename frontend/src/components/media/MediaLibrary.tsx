import { useEffect, useState } from "react";

import { api } from "../../services/api";
import { resolveMediaUrl } from "../../utils/media";

type MediaFile = {
  filename: string;
  url: string;
  size: number;
  uploaded_at: string;
};

type MediaLibraryProps = {
  onSelect: (url: string) => void;
  onClose: () => void;
};

export const MediaLibrary = ({ onSelect, onClose }: MediaLibraryProps) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data } = await api.get("/media/list");
        setFiles(data.files || []);
      } catch (error) {
        console.error("Erro ao carregar biblioteca de mídia:", error);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredFiles = files.filter((file) =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  const handleDelete = async (file: MediaFile) => {
    const confirmed = window.confirm(`Remover a imagem "${file.filename}"? Essa acao nao pode ser desfeita.`);
    if (!confirmed) return;

    try {
      setDeleting(file.filename);
      await api.delete(`/media/${encodeURIComponent(file.filename)}`);
      setFiles((prev) => prev.filter((item) => item.filename !== file.filename));
      if (selectedUrl === file.url) {
        setSelectedUrl(null);
      }
    } catch (error) {
      console.error("Erro ao remover midia:", error);
      alert("Nao foi possivel remover a imagem.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 9999,
        display: "grid",
        placeItems: "center",
        padding: "1.5rem",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "min(900px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
          display: "grid",
          gap: "1rem",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "0.5rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>Biblioteca de Mídia</h3>
            <p style={{ margin: "0.25rem 0 0", color: "var(--muted)", fontSize: "0.9em" }}>
              Selecione uma imagem já enviada ou faça upload de uma nova
            </p>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            Fechar
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por nome de arquivo..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          style={{
            padding: "0.75rem 1rem",
            borderRadius: 8,
            border: "1px solid var(--border)",
            fontSize: "0.95em",
          }}
        />

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
            Carregando biblioteca...
          </div>
        ) : filteredFiles.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              background: "var(--muted-bg, #f9fafb)",
              borderRadius: 8,
              color: "var(--muted)",
            }}
          >
            {searchTerm ? (
              <>Nenhum arquivo encontrado para "{searchTerm}"</>
            ) : (
              <>
                Nenhuma imagem na biblioteca ainda.
                <br />
                <small>Faça upload de imagens para vê-las aqui.</small>
              </>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "1rem",
              maxHeight: "400px",
              overflow: "auto",
              padding: "0.5rem",
            }}
          >
            {filteredFiles.map((file) => (
              <div
                key={file.url}
                onClick={() => setSelectedUrl(file.url)}
                style={{
                  cursor: "pointer",
                  border: selectedUrl === file.url ? "3px solid var(--primary)" : "1px solid var(--border)",
                  borderRadius: 8,
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                  background: "var(--card-bg, white)",
                  position: "relative",
                }}
                onMouseEnter={(event) => {
                  if (selectedUrl !== file.url) {
                    event.currentTarget.style.borderColor = "var(--primary)";
                    event.currentTarget.style.transform = "scale(1.02)";
                  }
                }}
                onMouseLeave={(event) => {
                  if (selectedUrl !== file.url) {
                    event.currentTarget.style.borderColor = "var(--border)";
                    event.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                <button
                  className="btn btn-ghost"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!deleting) {
                      void handleDelete(file);
                    }
                  }}
                  disabled={deleting === file.filename}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    padding: "0.2rem 0.45rem",
                    fontSize: "0.75rem",
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid var(--border)",
                    opacity: deleting === file.filename ? 0.6 : 1,
                    cursor: deleting === file.filename ? "not-allowed" : "pointer",
                    zIndex: 2,
                  }}
                  title="Remover imagem"
                >
                  {deleting === file.filename ? "Removendo..." : "Remover"}
                </button>
                <img
                  src={resolveMediaUrl(file.url)}
                  alt={file.filename}
                  style={{
                    width: "100%",
                    height: "120px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div style={{ padding: "0.5rem", fontSize: "0.75em" }}>
                  <div
                    style={{
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {file.filename}
                  </div>
                  <div style={{ color: "var(--muted)", marginTop: "0.25rem" }}>{formatFileSize(file.size)}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.9em" }}>{formatDate(file.uploaded_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "0.5rem",
            borderTop: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: "0.9em", color: "var(--muted)" }}>
            {filteredFiles.length} {filteredFiles.length === 1 ? "arquivo" : "arquivos"}
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSelect}
              disabled={!selectedUrl}
              style={{
                opacity: selectedUrl ? 1 : 0.5,
                cursor: selectedUrl ? "pointer" : "not-allowed",
              }}
            >
              Selecionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
