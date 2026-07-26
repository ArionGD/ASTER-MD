import { create } from "zustand";

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

interface DocState {
  filePath: string | null;
  fileName: string | null;
  content: string;
  toc: TocItem[];
  isSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  isSearchOpen: boolean;
  searchQuery: string;
  isPinned: boolean;
  recentFiles: string[];

  // Theme State
  theme: "dark" | "light";

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
  setSearchQuery: (query: string) => void;
  togglePinned: () => void;
  addRecentFile: (path: string) => void;
  setFolder: (folderPath: string | null, files: MarkdownFileItem[]) => void;
  toggleSyncScroll: () => void;
  toggleEditMode: () => void;
  toggleTheme: () => void;
  saveFile: () => Promise<boolean>;
}

export const useDocStore = create<DocState>((set, get) => ({
  filePath: null,
  fileName: null,
  content: "",
  toc: [],
  isSidebarOpen: true,
  isRightSidebarOpen: false,
  isSearchOpen: false,
  searchQuery: "",
  isPinned: false,
  recentFiles: [],

  theme: "dark",

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
}));
