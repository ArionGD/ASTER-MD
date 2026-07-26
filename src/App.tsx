import { useEffect } from "react";
import { TitleBar } from "./components/TitleBar";
import { Sidebar } from "./components/Sidebar";
import { SearchBar } from "./components/SearchBar";
import { MarkdownCanvas } from "./components/MarkdownCanvas";
import { RawMarkdownPanel } from "./components/RawMarkdownPanel";
import { EmptyState } from "./components/EmptyState";
import { useDocStore } from "./store/useDocStore";

export default function App() {
  const { content, isRightSidebarOpen, toggleSidebar, toggleRightSidebar, toggleSearch, theme } = useDocStore();
  const isDark = theme === "dark";

  // Global Keyboard Shortcuts (Ctrl+O, Ctrl+B, Ctrl+F, Ctrl+Shift+R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === "b") {
          e.preventDefault();
          toggleSidebar();
        } else if (e.key.toLowerCase() === "f") {
          e.preventDefault();
          toggleSearch();
        } else if (e.shiftKey && e.key.toLowerCase() === "r") {
          e.preventDefault();
          toggleRightSidebar();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar, toggleRightSidebar, toggleSearch]);

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden relative transition-colors ${
      isDark
        ? "bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200"
        : "bg-slate-50 text-slate-900 selection:bg-cyan-200 selection:text-cyan-900"
    }`}>
      {/* Header Ribbon Title Bar */}
      <TitleBar />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Search Bar Overlay */}
        <SearchBar />

        {/* Collapsible Left Directory & ToC Sidebar */}
        <Sidebar />

        {/* Content Body Area (Divided 50-50 when Right Panel is active) */}
        {content ? (
          <div className="flex-1 flex w-full h-full overflow-hidden">
            {/* Rendered Markdown Canvas */}
            <div className={`h-full overflow-hidden transition-all duration-200 flex flex-col ${
              isRightSidebarOpen ? "w-1/2" : "w-full"
            }`}>
              <MarkdownCanvas />
            </div>

            {/* Raw Markdown Source Panel (50% Split) */}
            {isRightSidebarOpen && (
              <div className="w-1/2 h-full overflow-hidden flex flex-col">
                <RawMarkdownPanel />
              </div>
            )}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
