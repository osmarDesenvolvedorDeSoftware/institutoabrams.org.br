import { resolveMediaUrl } from "../../utils/media";

type Props = {
  url?: string;
  label?: string;
  maxHeight?: number;
};

export const ImagePlaceholder = ({ url, label = "Nenhuma imagem selecionada", maxHeight = 200 }: Props) => {
  const resolved = resolveMediaUrl(url);
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
      {resolved ? (
        <img
          src={resolved}
          alt="Pré-visualização"
          style={{ width: "100%", height: "100%", objectFit: "contain", maxHeight, background: "#f8f6ef" }}
        />
      ) : (
        label
      )}
    </div>
  );
};
