import { useState } from "react";
import {
  Sparkles,
  FolderOpen,
  Sidebar as SidebarIcon,
  Search,
  Pin,
  Minus,
  Square,
  X,
  FileText,
  Code2,
  Sun,
  Moon,
  Settings,
  Presentation,
  Network,
  Maximize2,
} from "lucide-react";
import { useDocStore } from "../store/useDocStore";

export function TitleBar() {
  const {
    fileName,
    filePath,
    isSidebarOpen,
    toggleSidebar,
    isRightSidebarOpen,
    toggleRightSidebar,
    isSearchOpen,
    toggleSearch,
    toggleSettings,
    toggleQuickOpen,
    toggleGraphView,
    togglePresentation,
    isZenMode,
    toggleZenMode,
    isPinned,
    togglePinned,
    theme,
    toggleTheme,
    setDoc,
  } = useDocStore();

  const [isMaximized, setIsMaximized] = useState(false);

  const handleOpenFileDialog = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const { invoke } = await import("@tauri-apps/api/core");

      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Markdown",
            extensions: ["md", "markdown", "mdown", "txt"],
          },
        ],
      });

      if (selected && typeof selected === "string") {
        const content = await invoke<string>("read_file_content", { path: selected });
        setDoc(selected, content);
      }
    } catch (err) {
      console.warn("Native dialog error, fallback to web file input:", err);
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

  const handleMinimize = async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("minimize_window");
    } catch (e) {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().minimize();
      } catch (err) {
        console.error("Window minimize error:", err);
      }
    }
  };

  const handleMaximize = async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("toggle_maximize_window");
      setIsMaximized(!isMaximized);
    } catch (e) {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().toggleMaximize();
        setIsMaximized(!isMaximized);
      } catch (err) {
        console.error("Window maximize error:", err);
      }
    }
  };

  const handleClose = async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("close_window");
    } catch (e) {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().close();
      } catch (err) {
        console.error("Window close error:", err);
      }
    }
  };

  const handleTogglePin = async () => {
    const nextPinnedState = !isPinned;
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("set_always_on_top", { alwaysOnTop: nextPinnedState });
    } catch (e) {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().setAlwaysOnTop(nextPinnedState);
      } catch (err) {
        console.error("Window pin error:", err);
      }
    }
    togglePinned();
  };

  const isDark = theme === "dark";

  if (isZenMode) return null;

  return (
    <header
      data-tauri-drag-region
      className={`h-10 border-b flex items-center justify-between px-3 select-none z-50 shrink-0 backdrop-blur-md transition-colors ${
        isDark
          ? "bg-slate-950/95 border-slate-800/80 text-slate-100"
          : "bg-slate-100/95 border-slate-300/80 text-slate-800"
      }`}
    >
      {/* Left: Branding & Toggle Left Sidebar */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded-md transition-colors ${
            isSidebarOpen
              ? isDark
                ? "bg-slate-800 text-cyan-400"
                : "bg-slate-200 text-cyan-600 font-semibold"
              : isDark
              ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
          title="Toggle Left Directory Sidebar (Ctrl+B)"
        >
          <SidebarIcon className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 pointer-events-none pl-1">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className={`text-xs font-semibold tracking-wider uppercase ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            ASTER <span className="text-cyan-500 font-bold">MD</span>
          </span>
        </div>
      </div>

      {/* Center: File Title / Path Badge */}
      <div
        data-tauri-drag-region
        className="flex-1 flex justify-center items-center px-4 overflow-hidden"
      >
        {fileName ? (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border max-w-md overflow-hidden text-ellipsis whitespace-nowrap ${
            isDark ? "bg-slate-900/80 border-slate-800/80" : "bg-white/80 border-slate-300/80 shadow-xs"
          }`}>
            <FileText className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span className={`text-xs font-medium truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>{fileName}</span>
            {filePath && (
              <span className={`text-[10px] truncate max-w-[140px] ${isDark ? "text-slate-500" : "text-slate-400"}`} title={filePath}>
                ({filePath})
              </span>
            )}
          </div>
        ) : (
          <span className={`text-xs font-medium pointer-events-none ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            No document loaded
          </span>
        )}
      </div>

      {/* Right Controls Ribbon */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleOpenFileDialog}
          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 mr-1 cursor-pointer ${
            isDark
              ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/30 hover:bg-cyan-500/10"
              : "bg-white border-slate-300 text-slate-700 hover:text-cyan-600 hover:border-cyan-500/40 hover:bg-cyan-50/50"
          }`}
          title="Open File (Ctrl+O)"
        >
          <FolderOpen className="w-3.5 h-3.5 text-cyan-500" />
          <span>Open</span>
        </button>

        {/* Quick Open Search Palette (Ctrl+P) */}
        <button
          onClick={toggleQuickOpen}
          className={`p-1.5 rounded-md transition-colors ${
            isDark
              ? "text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60"
              : "text-slate-600 hover:text-cyan-600 hover:bg-slate-200/60"
          }`}
          title="Quick File Finder (Ctrl+P)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Knowledge Graph View */}
        <button
          onClick={toggleGraphView}
          className={`p-1.5 rounded-md transition-colors ${
            isDark
              ? "text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60"
              : "text-slate-600 hover:text-cyan-600 hover:bg-slate-200/60"
          }`}
          title="Open Interactive Knowledge Graph"
        >
          <Network className="w-4 h-4" />
        </button>

        {/* Slide Presentation Deck (F5) */}
        <button
          onClick={togglePresentation}
          className={`p-1.5 rounded-md transition-colors ${
            isDark
              ? "text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60"
              : "text-slate-600 hover:text-indigo-600 hover:bg-slate-200/60"
          }`}
          title="Slide Presentation Mode (F5)"
        >
          <Presentation className="w-4 h-4" />
        </button>

        {/* Zen Focus Mode (F11) */}
        <button
          onClick={toggleZenMode}
          className={`p-1.5 rounded-md transition-colors ${
            isDark
              ? "text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60"
              : "text-slate-600 hover:text-cyan-600 hover:bg-slate-200/60"
          }`}
          title="Zen Focus Mode (F11)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-1.5 rounded-md transition-colors ${
            isDark
              ? "text-amber-400 hover:bg-slate-800/60"
              : "text-amber-600 hover:bg-slate-200/60"
          }`}
          title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Customization Settings Button */}
        <button
          onClick={toggleSettings}
          className={`p-1.5 rounded-md transition-colors ${
            isDark
              ? "text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60"
              : "text-slate-600 hover:text-cyan-600 hover:bg-slate-200/60"
          }`}
          title="Customize Theme & Fonts"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Split View Toggle Button */}
        <button
          onClick={toggleRightSidebar}
          className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs ${
            isRightSidebarOpen
              ? "bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 font-medium"
              : isDark
              ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
          title="Toggle 50-50 Raw Source Split-View"
        >
          <Code2 className="w-4 h-4" />
          <span className="text-[11px]">Raw Split</span>
        </button>

        <button
          onClick={handleTogglePin}
          className={`p-1.5 rounded-md transition-colors ${
            isPinned
              ? "bg-cyan-500/20 text-cyan-500"
              : isDark
              ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
          title={isPinned ? "Unpin from top" : "Pin on top"}
        >
          <Pin className="w-4 h-4" />
        </button>

        <div className={`w-[1px] h-4 mx-1 ${isDark ? "bg-slate-800" : "bg-slate-300"}`} />

        {/* Window Control Buttons */}
        <button
          onClick={handleMinimize}
          className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
            isDark
              ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          }`}
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleMaximize}
          className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
            isDark
              ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          }`}
          title={isMaximized ? "Restore" : "Maximize"}
        >
          <Square className="w-3 h-3" />
        </button>

        <button
          onClick={handleClose}
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
