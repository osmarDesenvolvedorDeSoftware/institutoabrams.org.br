type Props = {
  label?: string;
};

export const MediaButton = ({ label = "Selecionar mídia" }: Props) => {
  return (
    <button
      type="button"
      className="btn btn-ghost"
      style={{
        width: "100%",
        justifyContent: "center",
        borderStyle: "dashed",
        borderColor: "var(--border)",
        background: "#fff",
      }}
    >
      {label}
    </button>
  );
};
