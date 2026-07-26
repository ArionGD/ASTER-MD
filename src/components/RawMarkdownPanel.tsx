import { useState, useRef } from "react";
import {
  FileText,
  Save,
  Check,
  Eye,
  Edit3,
  RefreshCw,
  X,
  Code,
  Heading,
  Table,
  Terminal,
  Zap,
  Info,
} from "lucide-react";
import { useDocStore } from "../store/useDocStore";
import { handleScrollSync } from "../utils/scrollSync";
import { getAccentClasses } from "../utils/themeAccent";

export function RawMarkdownPanel() {
  const {
    content,
    setContent,
    saveFile,
    isDirty,
    isSyncScrollEnabled,
    toggleSyncScroll,
    isEditMode,
    toggleEditMode,
    toggleRightSidebar,
    theme,
    accentColor,
    codeFont,
  } = useDocStore();

  const [copied, setCopied] = useState(false);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuIndex, setSlashMenuIndex] = useState(0);

  const rawContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = content.split("\n");
  const lineCount = Math.max(lines.length, 1);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const isDark = theme === "dark";
  const accent = getAccentClasses(accentColor);

  const slashOptions = [
    { label: "Heading 1", snippet: "# ", icon: Heading, desc: "Large title" },
    { label: "Heading 2", snippet: "## ", icon: Heading, desc: "Section header" },
    { label: "Code Block", snippet: "```typescript\n// your code here\n```\n", icon: Terminal, desc: "Syntax highlighted code" },
    { label: "Mermaid Diagram", snippet: "```mermaid\ngraph TD\n    A[Start] --> B[End]\n```\n", icon: Zap, desc: "Live diagram chart" },
    { label: "LaTeX Math Block", snippet: "$$\n\\text{Volume} = \\frac{4}{3}\\pi r^3\n$$\n", icon: Code, desc: "Mathematical equation" },
    { label: "Table Template", snippet: "| Header 1 | Header 2 |\n| --- | --- |\n| Row 1 | Data 1 |\n", icon: Table, desc: "GFM table structure" },
    { label: "Alert Callout Note", snippet: "> [!NOTE]\n> Add important note here\n", icon: Info, desc: "GitHub-style alert banner" },
  ];

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    await saveFile();
  };

  const onScroll = () => {
    if (!isSyncScrollEnabled || !rawContainerRef.current) return;
    const canvasContainer = document.getElementById("aster-markdown-canvas");
    if (canvasContainer) {
      handleScrollSync("raw", rawContainerRef.current, canvasContainer);
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      handleSave();
      return;
    }

    if (slashMenuOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashMenuIndex((prev) => (prev + 1) % slashOptions.length);
        return;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashMenuIndex((prev) => (prev - 1 + slashOptions.length) % slashOptions.length);
        return;
      } else if (e.key === "Enter") {
        e.preventDefault();
        insertSlashOption(slashOptions[slashMenuIndex]);
        return;
      } else if (e.key === "Escape") {
        setSlashMenuOpen(false);
        return;
      }
    }

    if (e.key === "/") {
      const textarea = textareaRef.current;
      if (textarea) {
        const val = textarea.value;
        const pos = textarea.selectionStart;
        const lastLineStart = val.lastIndexOf("\n", pos - 1) + 1;
        const lineText = val.substring(lastLineStart, pos);
        if (lineText.trim() === "") {
          setSlashMenuOpen(true);
          setSlashMenuIndex(0);
        }
      }
    }
  };

  const insertSlashOption = (option: typeof slashOptions[0]) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const val = content;
    const pos = textarea.selectionStart;
    const lastLineStart = val.lastIndexOf("\n", pos - 1) + 1;

    const before = val.substring(0, lastLineStart);
    const after = val.substring(pos);

    const newContent = before + option.snippet + after;
    setContent(newContent);
    setSlashMenuOpen(false);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = lastLineStart + option.snippet.length;
    }, 50);
  };

  return (
    <div
      className={`w-1/2 flex flex-col border-l select-text transition-colors relative ${
        isDark
          ? "bg-slate-950 border-slate-800 text-slate-200"
          : "bg-slate-100 border-slate-300 text-slate-800"
      }`}
    >
      {/* Top Ribbon Bar */}
      <div
        className={`h-9 border-b px-3 flex items-center justify-between shrink-0 text-xs font-medium select-none ${
          isDark
            ? "bg-slate-900/90 border-slate-800 text-slate-300"
            : "bg-white border-slate-300 text-slate-700"
        }`}
      >
        <div className="flex items-center gap-2">
          <FileText className={`w-3.5 h-3.5 ${accent.text}`} />
          <span className="font-semibold tracking-wide">RAW MARKDOWN</span>
          {isDirty && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes (Press Ctrl+S to save)" />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
              isDirty
                ? `${accent.btn} shadow-md shadow-cyan-500/10 cursor-pointer`
                : "bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed"
            }`}
            title="Save file changes to disk (Ctrl+S)"
          >
            <Save className="w-3 h-3" />
            <span>{isDirty ? "Save (Ctrl+S)" : "Saved"}</span>
          </button>

          <button
            onClick={toggleEditMode}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              isEditMode
                ? `${accent.bgSoft} ${accent.text} border ${accent.borderSoft}`
                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Live Text Edit Mode"
          >
            {isEditMode ? <Edit3 className={`w-3 h-3 ${accent.text}`} /> : <Eye className="w-3 h-3" />}
            <span>{isEditMode ? "Edit Mode" : "View Mode"}</span>
          </button>

          <button
            onClick={toggleSyncScroll}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              isSyncScrollEnabled
                ? `${accent.bgSoft} ${accent.text} border ${accent.borderSoft}`
                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Bidirectional Synchronized Scroll"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncScrollEnabled ? accent.text : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleCopyRaw}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Copy Raw Content"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={toggleRightSidebar}
            className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
            title="Close Split View"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div
        ref={rawContainerRef}
        onScroll={onScroll}
        style={{ fontFamily: codeFont }}
        className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed relative"
      >
        {/* Slash Command Popover Menu */}
        {slashMenuOpen && isEditMode && (
          <div className={`absolute top-12 left-16 z-50 w-64 rounded-xl border ${accent.borderSoft} bg-slate-900/95 shadow-2xl p-1.5 backdrop-blur-md animate-in fade-in duration-100`}>
            <div className={`px-2 py-1 text-[10px] font-bold ${accent.text} uppercase tracking-wider border-b border-slate-800 mb-1`}>
              Insert Snippet Menu (Press Enter)
            </div>
            {slashOptions.map((opt, idx) => {
              const Icon = opt.icon;
              const isSelected = idx === slashMenuIndex;
              return (
                <div
                  key={opt.label}
                  onClick={() => insertSlashOption(opt)}
                  onMouseEnter={() => setSlashMenuIndex(idx)}
                  className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isSelected ? `${accent.bgSoft} ${accent.text} font-semibold` : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${accent.text} shrink-0`} />
                  <div>
                    <p className="text-xs font-semibold">{opt.label}</p>
                    <p className="text-[10px] text-slate-500 font-normal">{opt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex min-h-full">
          {/* Line Numbers */}
          <div className="w-10 select-none pr-3 text-right text-slate-600 font-mono text-xs shrink-0 space-y-0.5">
            {lineNumbers.map((num) => (
              <div key={num} className="h-5 flex items-center justify-end text-[11px] leading-none">
                {num}
              </div>
            ))}
          </div>

          {/* Code Textarea or Plain Read-only Code View */}
          <div className="flex-1 min-w-0 pl-2">
            {isEditMode ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                style={{ fontFamily: codeFont }}
                className={`w-full min-h-full bg-transparent resize-none focus:outline-none font-mono text-xs leading-5 border-none p-0 ${
                  isDark ? "text-cyan-200 placeholder:text-slate-600" : "text-slate-900 placeholder:text-slate-400"
                }`}
                placeholder="Type your markdown source here... (Type '/' for snippet menu)"
                spellCheck={false}
              />
            ) : (
              <pre className={`font-mono text-xs leading-5 whitespace-pre-wrap break-words ${
                isDark ? "text-cyan-100" : "text-slate-900"
              }`}>
                {content}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
