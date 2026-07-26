import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { useDocStore, TocItem } from "../store/useDocStore";
import { CodeBlock } from "./CodeBlock";
import { handleScrollSync } from "../utils/scrollSync";

export function MarkdownCanvas() {
  const { content, setToc, isSyncScrollEnabled, theme } = useDocStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  // Extract ToC items whenever content changes
  useEffect(() => {
    if (!content) {
      setToc([]);
      return;
    }

    const headingLines = content.split("\n");
    const extractedToc: TocItem[] = [];

    headingLines.forEach((line) => {
      const match = line.match(/^(#{1-6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim().replace(/[*_~`]/g, "");
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");

        extractedToc.push({ id, text, level });
      }
    });

    setToc(extractedToc);
  }, [content, setToc]);

  // Synchronized scroll with Raw panel
  const onScroll = () => {
    if (!isSyncScrollEnabled || !canvasRef.current) return;
    const rawContainer = canvasRef.current.parentElement?.querySelector(".overflow-y-auto");
    if (rawContainer && rawContainer !== canvasRef.current) {
      handleScrollSync("canvas", canvasRef.current, rawContainer as HTMLElement);
    }
  };

  return (
    <div
      id="aster-markdown-canvas"
      ref={canvasRef}
      onScroll={onScroll}
      className={`flex-1 overflow-y-auto p-6 md:p-12 transition-colors ${
        isDark ? "bg-slate-950/60 text-slate-200 selection:bg-cyan-500/30" : "bg-white/90 text-slate-800 selection:bg-cyan-200"
      }`}
    >
      <article className={`max-w-4xl mx-auto space-y-6 leading-relaxed font-sans ${
        isDark ? "text-slate-200" : "text-slate-800"
      }`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeKatex]}
          components={{
            // Heading Customization with Auto IDs for ToC Scroll Sync
            h1: ({ children, ...props }) => {
              const text = String(children);
              const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
              return (
                <h1
                  id={id}
                  className="text-3xl font-bold text-slate-100 border-b border-slate-800/80 pb-3 mt-8 mb-4 tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text"
                  {...props}
                >
                  {children}
                </h1>
              );
            },
            h2: ({ children, ...props }) => {
              const text = String(children);
              const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
              return (
                <h2
                  id={id}
                  className="text-2xl font-semibold text-slate-200 border-b border-slate-800/50 pb-2 mt-6 mb-3 tracking-tight"
                  {...props}
                >
                  {children}
                </h2>
              );
            },
            h3: ({ children, ...props }) => {
              const text = String(children);
              const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
              return (
                <h3
                  id={id}
                  className="text-xl font-medium text-slate-300 mt-5 mb-2 tracking-tight"
                  {...props}
                >
                  {children}
                </h3>
              );
            },
            // Custom Code Block rendering
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).replace(/\n$/, "");

              if (!inline && (match || codeString.includes("\n"))) {
                return <CodeBlock language={match ? match[1] : ""} value={codeString} />;
              }

              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            // Custom Links
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-medium transition-colors"
              >
                {children}
              </a>
            ),
            // Custom Blockquotes
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-cyan-500/60 pl-4 py-1 my-4 bg-cyan-500/5 rounded-r-lg text-slate-300 italic">
                {children}
              </blockquote>
            ),
            // Custom Tables (GFM)
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 rounded-xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-left border-collapse text-sm">{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold">
                {children}
              </thead>
            ),
            th: ({ children }) => <th className="p-3 text-xs uppercase tracking-wider">{children}</th>,
            td: ({ children }) => <td className="p-3 border-t border-slate-800/60">{children}</td>,
            // Task List Checkboxes
            input: ({ type, checked, ...props }) => {
              if (type === "checkbox") {
                return (
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className="mr-2 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                    {...props}
                  />
                );
              }
              return <input type={type} {...props} />;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
