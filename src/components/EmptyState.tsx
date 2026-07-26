import React from "react";
import { FolderOpen, FileCode2, Upload } from "lucide-react";
import { useDocStore } from "../store/useDocStore";

export function EmptyState() {
  const { setDoc, theme } = useDocStore();
  const isDark = theme === "dark";

  const handleOpenFileDialog = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const { invoke } = await import("@tauri-apps/api/core");

      const selected = await open({
        multiple: false,
        filters: [{ name: "Markdown", extensions: ["md", "markdown", "txt"] }],
      });

      if (selected && typeof selected === "string") {
        const content = await invoke<string>("read_file_content", { path: selected });
        setDoc(selected, content);
      }
    } catch (err) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".md,.markdown,.txt";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const text = await file.text();
          setDoc(file.name, text);
        }
      };
      input.click();
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const text = await file.text();
      setDoc(file.name, text);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col items-center justify-center p-8 text-center select-none relative overflow-hidden transition-colors ${
        isDark ? "bg-radial from-slate-900/60 via-slate-950 to-slate-950" : "bg-radial from-slate-100 via-white to-slate-50 text-slate-800"
      }`}
    >
      {/* Decorative Glow Background */}
      <div className={`absolute w-[400px] h-[400px] blur-[120px] rounded-full pointer-events-none ${
        isDark ? "bg-cyan-500/5" : "bg-cyan-500/10"
      }`} />

      <div className="relative z-10 max-w-md flex flex-col items-center">
        <div className={`w-20 h-20 rounded-3xl border flex items-center justify-center mb-6 shadow-2xl group cursor-pointer hover:border-cyan-500/40 transition-all duration-300 ${
          isDark ? "bg-slate-900/90 border-slate-800 shadow-cyan-500/10" : "bg-white border-slate-200 shadow-slate-300/50"
        }`}>
          <FileCode2 className="w-10 h-10 text-cyan-500 group-hover:scale-110 transition-transform duration-300" />
        </div>

        <h1 className={`text-3xl font-bold mb-3 tracking-tight ${
          isDark
            ? "bg-gradient-to-r from-slate-100 via-slate-200 to-cyan-400 bg-clip-text text-transparent"
            : "bg-gradient-to-r from-slate-800 via-slate-900 to-cyan-700 bg-clip-text text-transparent"
        }`}>
          ASTER MD
        </h1>
        <p className={`text-sm leading-relaxed mb-8 max-w-sm ${
          isDark ? "text-slate-400" : "text-slate-600"
        }`}>
          Ultra-lightweight native desktop Markdown viewer with GFM, syntax highlighting, KaTeX math, and Mermaid diagrams.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <button
            onClick={handleOpenFileDialog}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Open Markdown File</span>
          </button>
        </div>

        <div className={`mt-8 flex items-center gap-2 text-[11px] px-4 py-2 rounded-full backdrop-blur-sm border ${
          isDark ? "text-slate-500 bg-slate-900/50 border-slate-800/80" : "text-slate-600 bg-white/70 border-slate-200 shadow-2xs"
        }`}>
          <Upload className="w-3.5 h-3.5 text-cyan-500" />
          <span>Or drag & drop any <b>.md</b> file anywhere here</span>
        </div>
      </div>
    </div>
  );
}
