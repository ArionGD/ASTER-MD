import { useEffect } from "react";
import { TitleBar } from "./components/TitleBar";
import { Sidebar } from "./components/Sidebar";
import { SearchBar } from "./components/SearchBar";
import { SettingsModal } from "./components/SettingsModal";
import { QuickOpenModal } from "./components/QuickOpenModal";
import { GraphViewModal } from "./components/GraphViewModal";
import { SlidePresentationModal } from "./components/SlidePresentationModal";
import { MarkdownCanvas } from "./components/MarkdownCanvas";
import { RawMarkdownPanel } from "./components/RawMarkdownPanel";
import { EmptyState } from "./components/EmptyState";
import { useDocStore } from "./store/useDocStore";

export default function App() {
  const {
    content,
    isRightSidebarOpen,
    toggleSidebar,
    toggleRightSidebar,
    toggleSearch,
    toggleQuickOpen,
    togglePresentation,
    toggleZenMode,
    isZenMode,
    theme,
  } = useDocStore();

  const isDark = theme === "dark";

  // Global Keyboard Shortcuts (Ctrl+O, Ctrl+B, Ctrl+F, Ctrl+P, F5, F11)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5") {
        e.preventDefault();
        togglePresentation();
        return;
      }

      if (e.key === "F11") {
        e.preventDefault();
        toggleZenMode();
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === "p" || e.key.toLowerCase() === "k") {
          e.preventDefault();
          toggleQuickOpen();
        } else if (e.key.toLowerCase() === "b") {
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
  }, [toggleSidebar, toggleRightSidebar, toggleSearch, toggleQuickOpen, togglePresentation, toggleZenMode]);

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden relative transition-colors ${
      isDark
        ? "bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200"
        : "bg-slate-50 text-slate-900 selection:bg-cyan-200 selection:text-cyan-900"
    }`}>
      {/* Feature Modals */}
      <SettingsModal />
      <QuickOpenModal />
      <GraphViewModal />
      <SlidePresentationModal />

      {/* Header Ribbon Title Bar */}
      <TitleBar />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Directory & Outline Sidebar */}
        {!isZenMode && <Sidebar />}

        {/* Center Main Workspace (Canvas or Split-View) */}
        {content ? (
          <div className="flex-1 flex overflow-hidden">
            <MarkdownCanvas />
            {isRightSidebarOpen && !isZenMode && <RawMarkdownPanel />}
          </div>
        ) : (
          <EmptyState />
        )}

        {/* Document In-Page Search Bar */}
        <SearchBar />
      </div>
    </div>
  );
}
