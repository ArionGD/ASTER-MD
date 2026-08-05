import React, { useEffect, useRef, useState } from "react";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { useDocStore } from "../store/useDocStore";

export function SearchBar() {
  const { isSearchOpen, toggleSearch, searchQuery, setSearchQuery } = useDocStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isSearchOpen]);

  // Execute DOM search matching & highlighting whenever searchQuery changes
  useEffect(() => {
    if (!isSearchOpen || !searchQuery.trim()) {
      clearHighlights();
      setMatchCount(0);
      setCurrentMatchIndex(0);
      return;
    }

    const canvas = document.getElementById("aster-markdown-canvas");
    if (!canvas) return;

    clearHighlights();

    const query = searchQuery.toLowerCase();
    const walker = document.createTreeWalker(canvas, NodeFilter.SHOW_TEXT, null);
    const matches: Node[] = [];

    let node: Node | null = walker.nextNode();
    while (node) {
      if (
        node.parentElement &&
        !["SCRIPT", "STYLE", "BUTTON", "INPUT", "CODE"].includes(node.parentElement.tagName) &&
        node.nodeValue?.toLowerCase().includes(query)
      ) {
        matches.push(node);
      }
      node = walker.nextNode();
    }

    let count = 0;
    matches.forEach((textNode) => {
      const parent = textNode.parentElement;
      if (!parent || !textNode.nodeValue) return;

      const fullText = textNode.nodeValue;
      const lowerText = fullText.toLowerCase();
      let index = lowerText.indexOf(query);

      if (index !== -1) {
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        while (index !== -1) {
          count++;
          fragment.appendChild(document.createTextNode(fullText.substring(lastIndex, index)));

          const mark = document.createElement("mark");
          mark.className = "aster-search-highlight bg-amber-400 text-slate-950 font-bold px-0.5 rounded";
          mark.setAttribute("data-match-index", String(count));
          mark.textContent = fullText.substring(index, index + query.length);
          fragment.appendChild(mark);

          lastIndex = index + query.length;
          index = lowerText.indexOf(query, lastIndex);
        }

        fragment.appendChild(document.createTextNode(fullText.substring(lastIndex)));
        parent.replaceChild(fragment, textNode);
      }
    });

    setMatchCount(count);
    if (count > 0) {
      setCurrentMatchIndex(1);
      scrollToMatch(1);
    } else {
      setCurrentMatchIndex(0);
    }
  }, [searchQuery, isSearchOpen]);

  const clearHighlights = () => {
    const highlights = document.querySelectorAll(".aster-search-highlight");
    highlights.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
        parent.normalize();
      }
    });
  };

  const scrollToMatch = (index: number) => {
    const highlights = document.querySelectorAll(".aster-search-highlight");
    highlights.forEach((el, i) => {
      if (i + 1 === index) {
        el.classList.add("ring-2", "ring-cyan-400", "bg-cyan-300");
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        el.classList.remove("ring-2", "ring-cyan-400", "bg-cyan-300");
      }
    });
  };

  const handleNextMatch = () => {
    if (matchCount === 0) return;
    const nextIdx = currentMatchIndex >= matchCount ? 1 : currentMatchIndex + 1;
    setCurrentMatchIndex(nextIdx);
    scrollToMatch(nextIdx);
  };

  const handlePrevMatch = () => {
    if (matchCount === 0) return;
    const prevIdx = currentMatchIndex <= 1 ? matchCount : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIdx);
    scrollToMatch(prevIdx);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrevMatch();
      } else {
        handleNextMatch();
      }
    } else if (e.key === "Escape") {
      clearHighlights();
      toggleSearch();
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className="absolute top-3 right-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl shadow-cyan-950/50 backdrop-blur-md text-xs animate-in fade-in slide-in-from-top-2 duration-150 select-none">
      <Search className="w-4 h-4 text-cyan-400 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Find in document..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 w-48 text-xs"
      />

      {searchQuery.trim() && (
        <span className="text-[11px] font-mono text-slate-400 px-1.5 border-r border-slate-800">
          {matchCount > 0 ? `${currentMatchIndex}/${matchCount}` : "0 matches"}
        </span>
      )}

      <div className="flex items-center gap-0.5">
        <button
          onClick={handlePrevMatch}
          disabled={matchCount === 0}
          className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 transition-colors"
          title="Previous match (Shift+Enter)"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleNextMatch}
          disabled={matchCount === 0}
          className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 transition-colors"
          title="Next match (Enter)"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            clearHighlights();
            toggleSearch();
          }}
          className="p-1 ml-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Close search (Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
