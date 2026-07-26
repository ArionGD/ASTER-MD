import { useState, useEffect } from "react";
import {
  List,
  History,
  Folder,
  FileText,
  ChevronRight,
  FolderOpen,
  RefreshCw,
  Search,
  BookOpen,
} from "lucide-react";
import { useDocStore, MarkdownFileItem } from "../store/useDocStore";
import { getAccentClasses } from "../utils/themeAccent";

export function Sidebar() {
  const {
    toc,
    recentFiles,
    filePath,
    isSidebarOpen,
    openFileByPath,
    currentFolder,
    currentFolderName,
    folderFiles,
    setFolder,
    theme,
    accentColor,
  } = useDocStore();

  const [activeTab, setActiveTab] = useState<"outline" | "recent">("outline");
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");
  const [folderSearchQuery, setFolderSearchQuery] = useState("");

  const isDark = theme === "dark";
  const accent = getAccentClasses(accentColor);

  // IntersectionObserver for ToC heading tracking
  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      { rootMargin: "-10% 0px -70% 0px" }
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  const handleOpenFolderDialog = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const { invoke } = await import("@tauri-apps/api/core");

      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (selected && typeof selected === "string") {
        const files = await invoke<MarkdownFileItem[]>("list_markdown_files", {
          dirPath: selected,
        });
        setFolder(selected, files);
      }
    } catch (err) {
      console.warn("Folder picker fallback / error:", err);
    }
  };

  const handleRefreshFolder = async () => {
    if (!currentFolder) return;
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const files = await invoke<MarkdownFileItem[]>("list_markdown_files", {
        dirPath: currentFolder,
      });
      setFolder(currentFolder, files);
    } catch (err) {
      console.error("Failed to refresh directory:", err);
    }
  };

  const filteredFolderFiles = folderFiles.filter((file) =>
    file.name.toLowerCase().includes(folderSearchQuery.toLowerCase())
  );

  if (!isSidebarOpen) return null;

  return (
    <aside
      className={`w-72 border-r flex flex-col select-none z-40 shrink-0 backdrop-blur-md transition-colors ${
        isDark
          ? "bg-slate-950/90 border-slate-800/80 text-slate-200"
          : "bg-slate-100/90 border-slate-300/80 text-slate-800"
      }`}
    >
      {/* Top Segment: Outline & Recent Files Tabs */}
      <div className="h-1/2 flex flex-col border-b border-slate-800/80 overflow-hidden">
        {/* Tab Headers */}
        <div className={`flex border-b text-xs font-semibold shrink-0 ${
          isDark ? "border-slate-800/80 bg-slate-900/50" : "border-slate-300/80 bg-white/50"
        }`}>
          <button
            onClick={() => setActiveTab("outline")}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === "outline"
                ? `${accent.border} ${accent.text} ${isDark ? "bg-slate-900/80" : "bg-white"}`
                : `border-transparent ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"}`
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Outline ({toc.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("recent")}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === "recent"
                ? `${accent.border} ${accent.text} ${isDark ? "bg-slate-900/80" : "bg-white"}`
                : `border-transparent ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"}`
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Recent ({recentFiles.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-3 text-xs">
          {activeTab === "outline" ? (
            toc.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 p-4 text-center">
                <BookOpen className="w-6 h-6 stroke-1 opacity-50" />
                <p className="text-[11px]">No outline headers found in current document.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {toc.map((item) => {
                  const isActive = activeHeadingId === item.id;
                  const indent = (item.level - 1) * 12;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      style={{ paddingLeft: `${indent + 8}px` }}
                      className={`block py-1.5 pr-2 rounded-md transition-colors truncate text-[11px] ${
                        isActive
                          ? `${accent.bgSoft} ${accent.text} font-semibold`
                          : isDark
                          ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      {item.text}
                    </a>
                  );
                })}
              </div>
            )
          ) : recentFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 p-4 text-center">
              <History className="w-6 h-6 stroke-1 opacity-50" />
              <p className="text-[11px]">No recent files opened yet.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentFiles.map((path) => {
                const isCurrent = filePath === path;
                const name = path.split(/[/\\]/).pop() || path;
                return (
                  <button
                    key={path}
                    onClick={() => openFileByPath(path)}
                    className={`w-full text-left p-2 rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
                      isCurrent
                        ? `${accent.bgSoft} ${accent.text} font-medium`
                        : isDark
                        ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    <FileText className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? accent.text : "text-slate-500"}`} />
                    <div className="truncate">
                      <p className="font-medium truncate text-[11px]">{name}</p>
                      <p className={`text-[9px] truncate ${isDark ? "text-slate-600" : "text-slate-400"}`}>{path}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Segment: Directory Explorer Block */}
      <div className="h-1/2 flex flex-col overflow-hidden">
        {/* Directory Explorer Header */}
        <div className={`p-3 border-b flex items-center justify-between shrink-0 ${
          isDark ? "border-slate-800/80 bg-slate-900/40" : "border-slate-300/80 bg-white/40"
        }`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <Folder className={`w-4 h-4 ${accent.text} shrink-0`} />
            <span className="text-xs font-bold uppercase tracking-wider truncate">
              {currentFolderName || "Directory Explorer"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {currentFolder && (
              <button
                onClick={handleRefreshFolder}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Refresh Folder Markdown Files"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleOpenFolderDialog}
              className={`px-2 py-1 rounded text-[11px] font-medium border flex items-center gap-1 transition-colors cursor-pointer ${
                isDark
                  ? `bg-slate-900 border-slate-800 text-slate-300 hover:${accent.text}`
                  : `bg-white border-slate-300 text-slate-700 hover:${accent.text}`
              }`}
              title="Open Local Folder Directory"
            >
              <FolderOpen className={`w-3 h-3 ${accent.text}`} />
              <span>Folder</span>
            </button>
          </div>
        </div>

        {/* Directory Filter Search Input */}
        {currentFolder && (
          <div className="px-3 py-2 border-b border-slate-800/60 flex items-center gap-2 bg-slate-950/40">
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Filter .md files..."
              value={folderSearchQuery}
              onChange={(e) => setFolderSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs focus:outline-none placeholder:text-slate-500 font-medium"
            />
          </div>
        )}

        {/* Folder Markdown Files List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {!currentFolder ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 p-4 text-center">
              <FolderOpen className="w-6 h-6 stroke-1 opacity-50" />
              <p className="text-[11px]">No folder opened.</p>
              <button
                onClick={handleOpenFolderDialog}
                className={`mt-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${accent.btn} transition-colors cursor-pointer`}
              >
                Open Folder
              </button>
            </div>
          ) : filteredFolderFiles.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 font-medium">
              No .md files found matching search filter.
            </div>
          ) : (
            filteredFolderFiles.map((file) => {
              const isCurrent = filePath === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => openFileByPath(file.path)}
                  className={`w-full text-left p-2 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                    isCurrent
                      ? `${accent.bgSoft} ${accent.text} border ${accent.borderSoft} font-semibold`
                      : isDark
                      ? "text-slate-300 hover:bg-slate-900/60 hover:text-slate-100"
                      : "text-slate-700 hover:bg-slate-200/60 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? accent.text : "text-slate-500"}`} />
                    <div className="truncate">
                      <p className="text-xs truncate">{file.name}</p>
                      {file.relative_path !== file.name && (
                        <p className="text-[9px] text-slate-500 truncate">{file.relative_path}</p>
                      )}
                    </div>
                  </div>

                  <ChevronRight className={`w-3 h-3 opacity-0 hover:opacity-100 transition-opacity ${
                    isCurrent ? `${accent.text} opacity-100` : "text-slate-500"
                  }`} />
                </button>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
