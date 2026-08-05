import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface MarkdownFileItem {
  name: string;
  path: string;
  relative_path: string;
}

export type AccentColor = "cyan" | "emerald" | "violet" | "amber" | "rose";
export type ProseFont = "Inter" | "Roboto" | "Outfit" | "System";
export type CodeFont = "JetBrains Mono" | "Fira Code";

interface DocState {
  filePath: string | null;
  fileName: string | null;
  content: string;
  toc: TocItem[];
  isSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  isSearchOpen: boolean;
  isSettingsOpen: boolean;
  searchQuery: string;
  isPinned: boolean;
  recentFiles: string[];

  // Advanced Feature Modals
  isQuickOpenVisible: boolean;
  isGraphViewVisible: boolean;
  isPresentationVisible: boolean;
  currentSlideIndex: number;
  isZenMode: boolean;

  // Theme & Accent Colors & Fonts
  theme: "dark" | "light";
  accentColor: AccentColor;
  proseFont: ProseFont;
  codeFont: CodeFont;

  // Synchronized Scroll & Live Edit State
  isSyncScrollEnabled: boolean;
  isEditMode: boolean;
  isDirty: boolean;

  // Folder Explorer State
  currentFolder: string | null;
  currentFolderName: string | null;
  folderFiles: MarkdownFileItem[];

  // Actions
  setDoc: (path: string | null, content: string, name?: string) => void;
  setContent: (content: string) => void;
  setToc: (toc: TocItem[]) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
  toggleSettings: () => void;
  setSettingsOpen: (open: boolean) => void;
  toggleQuickOpen: () => void;
  setQuickOpenVisible: (visible: boolean) => void;
  toggleGraphView: () => void;
  setGraphViewVisible: (visible: boolean) => void;
  togglePresentation: () => void;
  setPresentationVisible: (visible: boolean) => void;
  setCurrentSlideIndex: (index: number) => void;
  toggleZenMode: () => void;

  setSearchQuery: (query: string) => void;
  togglePinned: () => void;
  addRecentFile: (path: string) => void;
  setFolder: (folderPath: string | null, files: MarkdownFileItem[]) => void;
  toggleSyncScroll: () => void;
  toggleEditMode: () => void;
  toggleTheme: () => void;
  setAccentColor: (accent: AccentColor) => void;
  setProseFont: (font: ProseFont) => void;
  setCodeFont: (font: CodeFont) => void;
  saveFile: () => Promise<boolean>;
  openFileByPath: (path: string) => Promise<boolean>;
  restoreSavedSession: () => Promise<void>;
}

export const useDocStore = create<DocState>()(
  persist(
    (set, get) => ({
      filePath: null,
      fileName: null,
      content: "",
      toc: [],
      isSidebarOpen: true,
      isRightSidebarOpen: false,
      isSearchOpen: false,
      isSettingsOpen: false,
      searchQuery: "",
      isPinned: false,
      recentFiles: [],

      isQuickOpenVisible: false,
      isGraphViewVisible: false,
      isPresentationVisible: false,
      currentSlideIndex: 0,
      isZenMode: false,

      theme: "dark",
      accentColor: "cyan",
      proseFont: "Inter",
      codeFont: "JetBrains Mono",

      isSyncScrollEnabled: true,
      isEditMode: false,
      isDirty: false,

      currentFolder: null,
      currentFolderName: null,
      folderFiles: [],

      setDoc: (path, content, name) => {
        const extractedName = name || (path ? path.split(/[/\\]/).pop() || "Untitled.md" : "Untitled.md");
        set((state) => {
          const updatedRecent = path
            ? [path, ...state.recentFiles.filter((p) => p !== path)].slice(0, 10)
            : state.recentFiles;
          return {
            filePath: path,
            fileName: extractedName,
            content,
            isDirty: false,
            recentFiles: updatedRecent,
          };
        });
      },

      setContent: (content) => set({ content, isDirty: true }),
      setToc: (toc) => set({ toc }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),
      setRightSidebarOpen: (open) => set({ isRightSidebarOpen: open }),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      toggleQuickOpen: () => set((state) => ({ isQuickOpenVisible: !state.isQuickOpenVisible })),
      setQuickOpenVisible: (visible) => set({ isQuickOpenVisible: visible }),
      toggleGraphView: () => set((state) => ({ isGraphViewVisible: !state.isGraphViewVisible })),
      setGraphViewVisible: (visible) => set({ isGraphViewVisible: visible }),
      togglePresentation: () => set((state) => ({ isPresentationVisible: !state.isPresentationVisible, currentSlideIndex: 0 })),
      setPresentationVisible: (visible) => set({ isPresentationVisible: visible, currentSlideIndex: 0 }),
      setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),
      toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),

      setSearchQuery: (query) => set({ searchQuery: query }),
      togglePinned: () => set((state) => ({ isPinned: !state.isPinned })),
      addRecentFile: (path) =>
        set((state) => ({
          recentFiles: [path, ...state.recentFiles.filter((p) => p !== path)].slice(0, 10),
        })),

      setFolder: (folderPath, files) => {
        const name = folderPath ? folderPath.split(/[/\\]/).pop() || folderPath : null;
        set({
          currentFolder: folderPath,
          currentFolderName: name,
          folderFiles: files,
        });
      },

      toggleSyncScroll: () => set((state) => ({ isSyncScrollEnabled: !state.isSyncScrollEnabled })),
      toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
      toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),

      setAccentColor: (accent) => set({ accentColor: accent }),
      setProseFont: (font) => set({ proseFont: font }),
      setCodeFont: (font) => set({ codeFont: font }),

      saveFile: async () => {
        const { filePath, content } = get();
        if (!filePath) return false;
        try {
          const { invoke } = await import("@tauri-apps/api/core");
          await invoke("save_file_content", { path: filePath, content });
          set({ isDirty: false });
          return true;
        } catch (err) {
          console.error("Failed to save file to disk:", err);
          return false;
        }
      },

      openFileByPath: async (path: string) => {
        try {
          const { invoke } = await import("@tauri-apps/api/core");
          const fileContent = await invoke<string>("read_file_content", { path });
          get().setDoc(path, fileContent);
          return true;
        } catch (err) {
          console.error("Failed to open file by path:", err);
          return false;
        }
      },

      restoreSavedSession: async () => {
        const { filePath, currentFolder } = get();
        try {
          const { invoke } = await import("@tauri-apps/api/core");
          if (currentFolder) {
            const files = await invoke<MarkdownFileItem[]>("list_markdown_files", { folderPath: currentFolder });
            set({ folderFiles: files });
          }
          if (filePath) {
            const fileContent = await invoke<string>("read_file_content", { path: filePath });
            get().setDoc(filePath, fileContent);
          }
        } catch (err) {
          console.warn("Could not restore previous saved session:", err);
        }
      },
    }),
    {
      name: "aster-md-local-cache",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        accentColor: state.accentColor,
        proseFont: state.proseFont,
        codeFont: state.codeFont,
        recentFiles: state.recentFiles,
        currentFolder: state.currentFolder,
        filePath: state.filePath,
        isSyncScrollEnabled: state.isSyncScrollEnabled,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
);
