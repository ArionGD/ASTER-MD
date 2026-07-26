import { useState, useRef, useEffect } from "react";
import {
  Copy,
  Check,
  FileCode,
  X,
  RefreshCw,
  Edit3,
  Eye,
  Save,
  Link2,
  Unlink,
} from "lucide-react";
import { useDocStore } from "../store/useDocStore";
import { handleScrollSync } from "../utils/scrollSync";

export function RawMarkdownPanel() {
  const {
    content,
    setContent,
    filePath,
    isDirty,
    saveFile,
    isSyncScrollEnabled,
    toggleSyncScroll,
    isEditMode,
    toggleEditMode,
    toggleRightSidebar,
    theme,
  } = useDocStore();

  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const rawContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDark = theme === "dark";
  const lines = content.split("\n");

  // Sync scroll with Markdown Canvas
  const onScroll = () => {
    if (!isSyncScrollEnabled || !rawContainerRef.current) return;
    const canvasElement = document.getElementById("aster-markdown-canvas");
    if (canvasElement) {
      handleScrollSync("raw", rawContainerRef.current, canvasElement);
    }
  };

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy raw content:", e);
    }
  };

  const handleSave = async () => {
    if (isSaving || !filePath) return;
    setIsSaving(true);
    const success = await saveFile();
    setIsSaving(false);
    if (success) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filePath, content, isSaving]);

  return (
    <div className={`flex-1 flex flex-col h-full border-l overflow-hidden z-30 transition-colors ${
      isDark ? "bg-slate-950/95 border-slate-800/80 text-slate-100" : "bg-slate-50/95 border-slate-200 text-slate-800"
    }`}>
      {/* Header Ribbon */}
      <div className={`h-10 px-3 border-b flex items-center justify-between text-xs shrink-0 select-none backdrop-blur-md ${
        isDark ? "bg-slate-900/90 border-slate-800/80 text-slate-300" : "bg-slate-100/90 border-slate-200 text-slate-700"
      }`}>
        {/* Left Title & Badges */}
        <div className="flex items-center gap-2 overflow-hidden">
          <FileCode className="w-4 h-4 text-cyan-500 shrink-0" />
          <span className={`font-semibold tracking-wide truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            Raw Source
          </span>
          <span className={`text-[10px] border px-2 py-0.5 rounded-full font-mono shrink-0 ${
            isDark ? "text-slate-500 bg-slate-950 border-slate-800/80" : "text-slate-500 bg-white border-slate-300"
          }`}>
            {lines.length} lines
          </span>
          {isDirty && (
            <span className="text-[10px] bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium shrink-0 animate-pulse">
              Unsaved
            </span>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Sync Scroll Toggle */}
          <button
            onClick={toggleSyncScroll}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
              isSyncScrollEnabled
                ? "bg-cyan-500/20 text-cyan-500 border border-cyan-500/30"
                : isDark
                ? "bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:text-slate-200"
                : "bg-white text-slate-600 border border-slate-300 hover:text-slate-900"
            }`}
            title={isSyncScrollEnabled ? "Sync Scroll ON" : "Sync Scroll OFF"}
          >
            {isSyncScrollEnabled ? <Link2 className="w-3 h-3 text-cyan-500" /> : <Unlink className="w-3 h-3" />}
            <span>Sync Scroll</span>
          </button>

          {/* Edit Mode Toggle */}
          <button
            onClick={toggleEditMode}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
              isEditMode
                ? "bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 font-semibold"
                : isDark
                ? "bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:text-slate-200"
                : "bg-white text-slate-600 border border-slate-300 hover:text-slate-900"
            }`}
            title={isEditMode ? "Switch to View Mode" : "Enable Live Edit Mode"}
          >
            {isEditMode ? <Edit3 className="w-3 h-3 text-indigo-500" /> : <Eye className="w-3 h-3" />}
            <span>{isEditMode ? "Editing" : "Edit"}</span>
          </button>

          {/* Save Button */}
          {filePath && (
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                justSaved
                  ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                  : isDirty
                  ? "bg-amber-500/20 text-amber-600 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer"
                  : isDark
                  ? "bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed"
                  : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
              }`}
              title={filePath ? "Save changes to file (Ctrl+S)" : "No file open to save"}
            >
              {justSaved ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Saved</span>
                </>
              ) : isSaving ? (
                <>
                  <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                  <span>Saving</span>
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </>
              )}
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopyRaw}
            className={`p-1.5 rounded border transition-colors text-[11px] ${
              isDark ? "bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-cyan-300" : "bg-white border-slate-300 text-slate-600 hover:text-cyan-600"
            }`}
            title="Copy Raw Content"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Close Button */}
          <button
            onClick={toggleRightSidebar}
            className="p-1.5 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Close Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div
        ref={rawContainerRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed relative"
      >
        <div className="flex min-h-full">
          {/* Line Numbers */}
          <div className={`select-none pr-3 text-right font-mono text-[11px] space-y-0.5 border-r mr-3 shrink-0 ${
            isDark ? "text-slate-600 border-slate-800/60" : "text-slate-400 border-slate-200"
          }`}>
            {lines.map((_, i) => (
              <div key={i} className="leading-relaxed">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Content / Textarea */}
          <div className="flex-1 relative">
            {isEditMode ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type or paste Markdown source here..."
                className={`w-full h-full bg-transparent border-none outline-none resize-none font-mono text-xs leading-relaxed placeholder-slate-400 ${
                  isDark ? "text-cyan-100 selection:bg-cyan-500/30" : "text-slate-900 selection:bg-cyan-200"
                }`}
                spellCheck={false}
              />
            ) : (
              <pre className={`font-mono whitespace-pre-wrap break-words leading-relaxed ${
                isDark ? "text-cyan-100/90 selection:bg-cyan-500/30" : "text-slate-800 selection:bg-cyan-200"
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
