import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useDocStore } from "../store/useDocStore";

export function SearchBar() {
  const { isSearchOpen, toggleSearch, searchQuery, setSearchQuery } = useDocStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div className="absolute top-3 right-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl shadow-cyan-950/50 backdrop-blur-md text-xs animate-in fade-in slide-in-from-top-2 duration-150">
      <Search className="w-4 h-4 text-cyan-400 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Find in document..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 w-48 text-xs"
      />
      <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
        <button
          onClick={toggleSearch}
          className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Close search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
