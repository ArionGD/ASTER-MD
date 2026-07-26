import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useDocStore } from "../store/useDocStore";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [renderError, setRenderError] = useState<string | null>(null);
  const { theme } = useDocStore();

  useEffect(() => {
    let isMounted = true;

    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
      securityLevel: "loose",
      fontFamily: "Inter, sans-serif",
    });

    const renderChart = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) {
          setSvgContent(svg);
          setRenderError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn("Mermaid render error:", err);
          setRenderError(err?.message || "Invalid Mermaid Diagram syntax");
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, theme]);

  if (renderError) {
    return (
      <div className="p-3 my-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
        <p className="font-semibold mb-1">Mermaid Syntax Error:</p>
        <pre className="whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 p-4 rounded-xl border border-slate-800/60 bg-slate-900/40 flex justify-center items-center overflow-x-auto shadow-lg"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
