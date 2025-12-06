type Props = {
  url?: string;
  label?: string;
  maxHeight?: number;
};

export const ImagePlaceholder = ({ url, label = "Nenhuma imagem selecionada", maxHeight = 200 }: Props) => {
  return (
    <div
      style={{
        width: "100%",
        minHeight: 180,
        borderRadius: 12,
        border: "1px dashed var(--border)",
        background: "#f9fafb",
        display: "grid",
        placeItems: "center",
        color: "var(--muted)",
        fontWeight: 600,
        overflow: "hidden",
      }}
    >
      {url ? (
        <img
          src={url}
          alt="Pré-visualização"
          style={{ width: "100%", height: "100%", objectFit: "cover", maxHeight }}
        />
      ) : (
        label
      )}
    </div>
  );
};
