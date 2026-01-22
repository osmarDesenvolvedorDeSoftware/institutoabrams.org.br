import React, { useState } from "react";

export type FieldWithHelpProps = {
  label: string;
  helpText: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
};

export const FieldWithHelp = ({
  label,
  helpText,
  required = false,
  error,
  children,
}: FieldWithHelpProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleToggleTooltip = () => {
    setShowTooltip((prev) => !prev);
  };

  return (
    <div style={{ display: "grid", gap: "0.35rem", position: "relative" }}>
      <label
        style={{
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {label}
        {required && <span style={{ color: "var(--error, red)" }}>*</span>}

        <span
          role="button"
          tabIndex={0}
          aria-label={`Ajuda: ${label}`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          onClick={handleToggleTooltip}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleToggleTooltip();
            }
          }}
          style={{
            cursor: "help",
            fontSize: "0.85em",
            color: "var(--muted)",
            border: "1px solid var(--muted)",
            borderRadius: "50%",
            width: "18px",
            height: "18px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
          }}
        >
          ?
        </span>

        {showTooltip && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: "0.25rem",
              padding: "0.5rem 0.75rem",
              background: "var(--background, #1a1a1a)",
              color: "var(--text, white)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              fontSize: "0.85em",
              maxWidth: "300px",
              zIndex: 1000,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {helpText}
          </div>
        )}
      </label>

      {children}

      <small style={{ color: error ? "var(--error, red)" : "var(--muted)" }}>
        {error || helpText}
      </small>
    </div>
  );
};
