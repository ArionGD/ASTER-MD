import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import {
  Info,
  Lightbulb,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Clock,
  FileText,
  CheckSquare,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useDocStore, TocItem } from "../store/useDocStore";
import { CodeBlock } from "./CodeBlock";
import { MermaidDiagram } from "./MermaidDiagram";
import { FrontmatterCard } from "./FrontmatterCard";
import { handleScrollSync } from "../utils/scrollSync";

// Helper function to extract YAML frontmatter
function parseFrontmatter(rawContent: string): { metadata: Record<string, any>; body: string } {
  if (!rawContent.startsWith("---")) {
    return { metadata: {}, body: rawContent };
  }

  const matches = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!matches) {
    return { metadata: {}, body: rawContent };
  }

  const yamlText = matches[1];
  const body = matches[2];
  const metadata: Record<string, any> = {};

  yamlText.split("\n").forEach((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.substring(0, colonIdx).trim();
      let value: any = line.substring(colonIdx + 1).trim();

      if (value.startsWith("[") && value.endsWith("]")) {
        value = value
          .substring(1, value.length - 1)
          .split(",")
          .map((v: string) => v.trim().replace(/^['"]|['"]$/g, ""));
      } else {
        value = value.replace(/^['"]|['"]$/g, "");
      }

      if (key) metadata[key] = value;
    }
  });

  return { metadata, body };
}

// Emoji shortcode dictionary transformer & Wiki-Link transformer
function transformText(text: string): string {
  const emojiMap: Record<string, string> = {
    ":rocket:": "🚀",
    ":fire:": "🔥",
    ":star:": "⭐",
    ":check:": "✅",
    ":sparkles:": "✨",
    ":heart:": "❤️",
    ":bug:": "🐛",
    ":bulb:": "💡",
    ":warning:": "⚠️",
    ":smile:": "😊",
    ":gear:": "⚙️",
    ":memo:": "📝",
    ":zap:": "⚡",
    ":tada:": "🎉",
    ":lock:": "🔒",
  };

  let result = text;
  Object.entries(emojiMap).forEach(([shortcode, glyph]) => {
    result = result.replaceAll(shortcode, glyph);
  });

  // Transform [[WikiLinks]] into markdown links [Display Text](#wikilink:TargetFile)
  result = result.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, display) => {
    const label = display ? display.trim() : target.trim();
    const cleanTarget = target.trim();
    return `[🔗 ${label}](#wikilink:${cleanTarget})`;
  });

  return result;
}

export function MarkdownCanvas() {
  const {
    content,
    setToc,
    isSyncScrollEnabled,
    theme,
    proseFont,
    codeFont,
    folderFiles,
    openFileByPath,
    isZenMode,
    toggleZenMode,
  } = useDocStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  const { metadata, body } = parseFrontmatter(content);
  const parsedContent = transformText(body);

  // Compute Document Stats
  const words = parsedContent.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const lines = parsedContent.split("\n").length;
  const checkboxes = (parsedContent.match(/\[[ xX]\]/g) || []).length;
  const checkedBoxes = (parsedContent.match(/\[[xX]\]/g) || []).length;

  // Extract ToC items whenever content changes
  useEffect(() => {
    if (!parsedContent) {
      setToc([]);
      return;
    }

    const headingLines = parsedContent.split("\n");
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
  }, [parsedContent, setToc]);

  // Synchronized scroll with Raw panel
  const onScroll = () => {
    if (!isSyncScrollEnabled || !canvasRef.current) return;
    const rawContainer = canvasRef.current.parentElement?.querySelector(".overflow-y-auto");
    if (rawContainer && rawContainer !== canvasRef.current) {
      handleScrollSync("canvas", canvasRef.current, rawContainer as HTMLElement);
    }
  };

  // Handle Wiki-Link Navigation Click
  const handleWikiLinkClick = (targetName: string) => {
    const cleanTargetName = targetName.replace(/\.md$/, "").toLowerCase();
    const foundFile = folderFiles.find(
      (f) =>
        f.name.toLowerCase().replace(/\.md$/, "") === cleanTargetName ||
        f.name.toLowerCase() === cleanTargetName
    );

    if (foundFile) {
      openFileByPath(foundFile.path);
    } else {
      console.warn(`Wiki-link file "${targetName}" not found in current folder workspace.`);
    }
  };

  const fontFamilyStyle = proseFont === "System" ? "system-ui, sans-serif" : `${proseFont}, sans-serif`;

  return (
    <div
      id="aster-markdown-canvas"
      ref={canvasRef}
      onScroll={onScroll}
      style={{ fontFamily: fontFamilyStyle }}
      className={`flex-1 overflow-y-auto p-6 md:p-12 transition-colors relative ${
        isDark ? "bg-slate-950/60 text-slate-200 selection:bg-cyan-500/30" : "bg-white/90 text-slate-800 selection:bg-cyan-200"
      }`}
    >
      {/* Zen Mode Exit Button Floating Indicator */}
      {isZenMode && (
        <button
          onClick={toggleZenMode}
          className="fixed top-4 right-6 z-50 p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 backdrop-blur-md shadow-2xl hover:bg-cyan-500 hover:text-slate-950 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="Exit Zen Focus Mode (F11)"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Exit Zen</span>
        </button>
      )}

      <article className={`max-w-4xl mx-auto space-y-6 leading-relaxed ${
        isDark ? "text-slate-200" : "text-slate-800"
      }`}>
        {/* Render Frontmatter Metadata Card if present */}
        {Object.keys(metadata).length > 0 && <FrontmatterCard metadata={metadata} />}

        {/* Top Reading Stats Bar */}
        {words > 30 && (
          <div className={`flex flex-wrap items-center gap-4 py-2 px-4 rounded-xl border text-xs mb-6 select-none ${
            isDark ? "bg-slate-900/60 border-slate-800/80 text-slate-400" : "bg-slate-100/70 border-slate-200 text-slate-600"
          }`}>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{readingTime} min read</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>{words} words • {lines} lines</span>
            </div>
            {checkboxes > 0 && (
              <div className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>{checkedBoxes}/{checkboxes} tasks completed</span>
              </div>
            )}
          </div>
        )}

        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
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
            // Code & Mermaid Diagram rendering
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : "";
              const codeString = String(children).replace(/\n$/, "");

              if (language === "mermaid") {
                return <MermaidDiagram chart={codeString} />;
              }

              if (!inline && (match || codeString.includes("\n"))) {
                return <CodeBlock language={language} value={codeString} />;
              }

              return (
                <code
                  style={{ fontFamily: codeFont }}
                  className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-cyan-300 text-xs"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            // Custom Links & WikiLinks Support
            a: ({ href, children }) => {
              if (href && href.startsWith("#wikilink:")) {
                const targetName = href.replace("#wikilink:", "");
                return (
                  <button
                    onClick={() => handleWikiLinkClick(targetName)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 font-semibold text-xs transition-colors cursor-pointer"
                    title={`Open internal note: ${targetName}`}
                  >
                    {children}
                  </button>
                );
              }

              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-medium transition-colors"
                >
                  {children}
                </a>
              );
            },
            // Custom Blockquotes with GitHub-style Alerts support
            blockquote: ({ children }: any) => {
              const textContent = String(children?.[1]?.props?.children?.[0] || children?.[0]?.props?.children || "").trim();

              if (textContent.startsWith("[!NOTE]")) {
                return (
                  <div className="my-4 p-4 rounded-xl bg-cyan-500/10 border-l-4 border-cyan-500 text-cyan-200 text-sm">
                    <div className="flex items-center gap-2 font-bold mb-1 text-cyan-400">
                      <Info className="w-4 h-4" />
                      <span>NOTE</span>
                    </div>
                    <div>{children}</div>
                  </div>
                );
              }

              if (textContent.startsWith("[!TIP]")) {
                return (
                  <div className="my-4 p-4 rounded-xl bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-200 text-sm">
                    <div className="flex items-center gap-2 font-bold mb-1 text-emerald-400">
                      <Lightbulb className="w-4 h-4" />
                      <span>TIP</span>
                    </div>
                    <div>{children}</div>
                  </div>
                );
              }

              if (textContent.startsWith("[!IMPORTANT]")) {
                return (
                  <div className="my-4 p-4 rounded-xl bg-violet-500/10 border-l-4 border-violet-500 text-violet-200 text-sm">
                    <div className="flex items-center gap-2 font-bold mb-1 text-violet-400">
                      <Flame className="w-4 h-4" />
                      <span>IMPORTANT</span>
                    </div>
                    <div>{children}</div>
                  </div>
                );
              }

              if (textContent.startsWith("[!WARNING]")) {
                return (
                  <div className="my-4 p-4 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-amber-200 text-sm">
                    <div className="flex items-center gap-2 font-bold mb-1 text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>WARNING</span>
                    </div>
                    <div>{children}</div>
                  </div>
                );
              }

              if (textContent.startsWith("[!CAUTION]")) {
                return (
                  <div className="my-4 p-4 rounded-xl bg-rose-500/10 border-l-4 border-rose-500 text-rose-200 text-sm">
                    <div className="flex items-center gap-2 font-bold mb-1 text-rose-400">
                      <ShieldAlert className="w-4 h-4" />
                      <span>CAUTION</span>
                    </div>
                    <div>{children}</div>
                  </div>
                );
              }

              return (
                <blockquote className="border-l-4 border-cyan-500/60 pl-4 py-1 my-4 bg-cyan-500/5 rounded-r-lg text-slate-300 italic">
                  {children}
                </blockquote>
              );
            },
            // Custom Tables (GFM)
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
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
          {parsedContent}
        </ReactMarkdown>
      </article>
    </div>
  );
}
