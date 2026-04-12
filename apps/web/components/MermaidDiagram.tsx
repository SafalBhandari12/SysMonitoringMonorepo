"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
  id: string;
  className?: string;
}

export default function MermaidDiagram({
  chart,
  id,
  className = "",
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "IBM Plex Mono, Courier New, monospace",
      fontSize: 14,
    });

    if (containerRef.current) {
      mermaid.contentLoaded();
    }
  }, [id]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={`mermaid ${className}`}
      dangerouslySetInnerHTML={{ __html: chart }}
    />
  );
}
