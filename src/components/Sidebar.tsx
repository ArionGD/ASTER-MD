import { useState } from "react";
import {
  List,
  Clock,
  FileText,
  ChevronRight,
  Hash,
  Folder,
  FolderPlus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useDocStore, TocItem, MarkdownFileItem } from "../store/useDocStore";

export function Sidebar() {
  const {
    isSidebarOpen,
    toc,
    recentFiles,
    filePath,
    setDoc,
    currentFolder,
    currentFolderName,
    folderFiles,
    setFolder,
    theme,
  } = useDocStore();

  const [activeTab, setActiveTab] = useState<"toc" | "recents">("toc");
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [folderFilter, setFolderFilter] = useState("");
  const [isLoadingFolder, setIsLoadingFolder] = useState(false);

  if (!isSidebarOpen) return null;

  const isDark = theme === "dark";

  const scrollToHeading = (id: string) => {
    setActiveHeadingId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenFolderDialog = async () => {
    setIsLoadingFolder(true);
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const { invoke } = await import("@tauri-apps/api/core");

      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (selected && typeof selected === "string") {
        const files = await invoke<MarkdownFileItem[]>("list_markdown_files", {
          folderPath: selected,
        });
        setFolder(selected, files);
      }
    } catch (err) {
      console.warn("Folder dialog failed:", err);
    } finally {
      setIsLoadingFolder(false);
    }
  };

  const handleRefreshFolder = async () => {
    if (!currentFolder) return;
    setIsLoadingFolder(true);
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const files = await invoke<MarkdownFileItem[]>("list_markdown_files", {
        folderPath: currentFolder,
      });
      setFolder(currentFolder, files);
    } catch (err) {
      console.error("Refresh folder error:", err);
    } finally {
      setIsLoadingFolder(false);
    }
  };

  const handleOpenFolderFile = async (file: MarkdownFileItem) => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const content = await invoke<string>("read_file_content", { path: file.path });
      setDoc(file.path, content, file.name);
    } catch (e) {
      console.error("Failed to read file from folder:", e);
    }
  };

  const handleOpenRecent = async (path: string) => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const content = await invoke<string>("read_file_content", { path });
      setDoc(path, content);
    } catch (e) {
      console.error("Failed to open recent file:", e);
    }
  };

  const filteredFolderFiles = folderFiles.filter(
    (f) =>
      f.name.toLowerCase().includes(folderFilter.toLowerCase()) ||
      f.relative_path.toLowerCase().includes(folderFilter.toLowerCase())
  );

  return (
    <aside className={`w-64 border-r flex flex-col h-full select-none shrink-0 z-40 backdrop-blur-md overflow-hidden transition-colors ${
      isDark
        ? "bg-slate-950/90 border-slate-800/60 text-slate-100"
        : "bg-slate-50/95 border-slate-200 text-slate-800"
    }`}>
      {/* Upper Half: ToC / Recents Tabs */}
      <div className={`flex flex-col h-1/2 border-b ${isDark ? "border-slate-800/80" : "border-slate-200"}`}>
        <div className={`flex items-center border-b px-2 pt-2 gap-1 shrink-0 ${
          isDark ? "border-slate-800/60 bg-slate-900/40" : "border-slate-200 bg-slate-100/60"
        }`}>
          <button
            onClick={() => setActiveTab("toc")}
            className={`flex-1 py-1.5 px-2 rounded-t-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border-t border-x ${
              activeTab === "toc"
                ? isDark
                  ? "bg-slate-900 border-slate-800 text-cyan-400 font-semibold"
                  : "bg-white border-slate-200 text-cyan-600 font-semibold shadow-2xs"
                : isDark
                ? "border-transparent text-slate-400 hover:text-slate-200"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Outline ({toc.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("recents")}
            className={`flex-1 py-1.5 px-2 rounded-t-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border-t border-x ${
              activeTab === "recents"
                ? isDark
                  ? "bg-slate-900 border-slate-800 text-cyan-400 font-semibold"
                  : "bg-white border-slate-200 text-cyan-600 font-semibold shadow-2xs"
                : isDark
                ? "border-transparent text-slate-400 hover:text-slate-200"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recent ({recentFiles.length})</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {activeTab === "toc" ? (
            toc.length > 0 ? (
              toc.map((item: TocItem) => {
                const isSelected = activeHeadingId === item.id;
                const indentClass =
                  item.level === 1
                    ? `pl-2 font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`
                    : item.level === 2
                    ? `pl-5 ${isDark ? "text-slate-300" : "text-slate-700"}`
                    : item.level === 3
                    ? `pl-8 text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`
                    : `pl-11 text-[10px] ${isDark ? "text-slate-500" : "text-slate-500"}`;

                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToHeading(item.id)}
                    className={`w-full text-left py-1.5 pr-2 rounded-md text-xs transition-colors flex items-center gap-1.5 ${
                      isDark ? "hover:bg-slate-900" : "hover:bg-slate-200/60"
                    } ${indentClass} ${
                      isSelected
                        ? isDark
                          ? "bg-cyan-500/10 text-cyan-400 font-medium"
                          : "bg-cyan-500/15 text-cyan-700 font-semibold"
                        : ""
                    }`}
                  >
                    <Hash className="w-3 h-3 text-cyan-500/60 shrink-0" />
                    <span className="truncate">{item.text}</span>
                  </button>
                );
              })
            ) : (
              <div className={`text-center py-6 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                <List className="w-6 h-6 mx-auto mb-1 opacity-30" />
                <span>No outline headers</span>
              </div>
            )
          ) : recentFiles.length > 0 ? (
            recentFiles.map((file) => {
              const isCurrent = file === filePath;
              const name = file.split(/[/\\]/).pop() || file;

              return (
                <button
                  key={file}
                  onClick={() => handleOpenRecent(file)}
                  className={`w-full text-left p-2 rounded-md text-xs transition-colors flex items-center gap-2 ${
                    isDark ? "hover:bg-slate-900 text-slate-300" : "hover:bg-slate-200/60 text-slate-700"
                  } ${
                    isCurrent
                      ? isDark
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "bg-cyan-500/15 text-cyan-700 border border-cyan-500/30"
                      : ""
                  }`}
                  title={file}
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate font-medium">{name}</div>
                    <div className={`text-[10px] truncate opacity-70 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{file}</div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                </button>
              );
            })
          ) : (
            <div className={`text-center py-6 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              <Clock className="w-6 h-6 mx-auto mb-1 opacity-30" />
              <span>No recent files</span>
            </div>
          )}
        </div>
      </div>

      {/* Lower Half: Directory Explorer Block */}
      <div className={`flex-1 flex flex-col h-1/2 overflow-hidden ${
        isDark ? "bg-slate-950/60" : "bg-slate-100/40"
      }`}>
        {/* Directory Explorer Header */}
        <div className={`p-2 border-b flex items-center justify-between shrink-0 ${
          isDark ? "bg-slate-900/60 border-slate-800/60" : "bg-slate-200/50 border-slate-200"
        }`}>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Folder className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span className={`text-xs font-semibold truncate ${isDark ? "text-slate-300" : "text-slate-700"}`} title={currentFolder || undefined}>
              {currentFolderName || "Directory Explorer"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {currentFolder && (
              <button
                onClick={handleRefreshFolder}
                className={`p-1 rounded transition-colors ${
                  isDark ? "text-slate-400 hover:text-cyan-400 hover:bg-slate-800" : "text-slate-500 hover:text-cyan-600 hover:bg-slate-200"
                }`}
                title="Refresh folder"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFolder ? "animate-spin text-cyan-500" : ""}`} />
              </button>
            )}
            <button
              onClick={handleOpenFolderDialog}
              className={`p-1 rounded transition-colors flex items-center gap-1 text-[11px] ${
                isDark ? "text-slate-400 hover:text-cyan-400 hover:bg-slate-800" : "text-slate-500 hover:text-cyan-600 hover:bg-slate-200"
              }`}
              title="Open Directory"
            >
              <FolderPlus className="w-3.5 h-3.5 text-cyan-500" />
            </button>
          </div>
        </div>

        {/* Search filter within directory */}
        {currentFolder && folderFiles.length > 5 && (
          <div className="px-2 pt-2 shrink-0">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs ${
              isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-300 text-slate-800"
            }`}>
              <Search className="w-3 h-3 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Filter .md files..."
                value={folderFilter}
                onChange={(e) => setFolderFilter(e.target.value)}
                className="bg-transparent border-none outline-none placeholder-slate-400 w-full text-[11px]"
              />
            </div>
          </div>
        )}

        {/* Directory File List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {currentFolder ? (
            filteredFolderFiles.length > 0 ? (
              filteredFolderFiles.map((file) => {
                const isCurrent = file.path === filePath;
                return (
                  <button
                    key={file.path}
                    onClick={() => handleOpenFolderFile(file)}
                    className={`w-full text-left p-1.5 rounded-md text-xs transition-colors flex items-center gap-2 ${
                      isDark ? "hover:bg-slate-900 text-slate-300" : "hover:bg-slate-200/60 text-slate-700"
                    } ${
                      isCurrent
                        ? isDark
                          ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-medium"
                          : "bg-cyan-500/20 text-cyan-700 border border-cyan-500/40 font-semibold"
                        : ""
                    }`}
                    title={file.path}
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate font-medium text-[11px]">{file.name}</div>
                      {file.relative_path !== file.name && (
                        <div className={`text-[9px] truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}>{file.relative_path}</div>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className={`text-center py-6 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                <span>No matching markdown files</span>
              </div>
            )
          ) : (
            <div className="text-center py-8 px-4 text-xs flex flex-col items-center">
              <FolderPlus className="w-8 h-8 text-cyan-500/40 mb-2" />
              <p className={`mb-3 text-[11px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Open a folder to list and quickly view all its <b>.md</b> documents.
              </p>
              <button
                onClick={handleOpenFolderDialog}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/20 text-[11px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Open Folder</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
