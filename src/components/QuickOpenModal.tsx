import { useState, useEffect, useRef } from "react";
import { Search, FileText, X, CornerDownLeft } from "lucide-react";
import { useDocStore, MarkdownFileItem } from "../store/useDocStore";
import { getAccentClasses } from "../utils/themeAccent";

export function QuickOpenModal() {
  const {
    isQuickOpenVisible,
    setQuickOpenVisible,
    folderFiles,
    recentFiles,
    openFileByPath,
    theme,
    accentColor,
  } = useDocStore();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === "dark";
  const accent = getAccentClasses(accentColor);

  const combinedList: MarkdownFileItem[] = [];
  const addedPaths = new Set<string>();

  folderFiles.forEach((f) => {
    if (!addedPaths.has(f.path)) {
      addedPaths.add(f.path);
      combinedList.push(f);
    }
  });

  recentFiles.forEach((p) => {
    if (!addedPaths.has(p)) {
      addedPaths.add(p);
      const name = p.split(/[/\\]/).pop() || p;
      combinedList.push({ name, path: p, relative_path: name });
    }
  });

  const filteredList = combinedList.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.path.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isQuickOpenVisible) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isQuickOpenVisible]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleOpenSelected = (item?: MarkdownFileItem) => {
    const target = item || filteredList[selectedIndex];
    if (target) {
      openFileByPath(target.path);
      setQuickOpenVisible(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredList.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredList.length) % Math.max(1, filteredList.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleOpenSelected();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setQuickOpenVisible(false);
    }
  };

  if (!isQuickOpenVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/90"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-400/40"
        }`}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800/80 gap-3">
          <Search className={`w-4 h-4 ${accent.text} shrink-0`} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to quick open file... (Press Enter to open)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-500 font-medium"
          />
          <button
            onClick={() => setQuickOpenVisible(false)}
            className="p-1 rounded-md text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              No matching markdown files found in current workspace.
            </div>
          ) : (
            filteredList.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.path}
                  onClick={() => handleOpenSelected(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? `${accent.bgSoft} ${accent.borderSoft} ${accent.text} font-medium`
                      : "bg-transparent border-transparent text-slate-300 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className={`w-4 h-4 shrink-0 ${isSelected ? accent.text : "text-slate-500"}`} />
                    <div className="overflow-hidden truncate">
                      <p className="text-xs font-semibold truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.path}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className={`flex items-center gap-1 text-[10px] font-semibold ${accent.text} ${accent.bgSoft} px-2 py-0.5 rounded-md border ${accent.borderSoft}`}>
                      <span>Open</span>
                      <CornerDownLeft className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Tip */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">↓</kbd></span>
          <span>Select with <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Enter</kbd></span>
        </div>
      </div>
    </div>
  );
}
