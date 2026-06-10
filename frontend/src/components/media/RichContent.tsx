import { CSSProperties, useEffect, useRef } from "react";

import { processSocialEmbedsInContainer } from "./VideoEmbed";

type Props = {
  html: string;
  className?: string;
  style?: CSSProperties;
};

export const RichContent = ({ html, className, style }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    processSocialEmbedsInContainer(container).catch(() => undefined);
  }, [html]);

  return <div ref={containerRef} className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
};