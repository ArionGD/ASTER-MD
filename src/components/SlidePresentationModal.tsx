import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { X, ChevronLeft, ChevronRight, Presentation, Maximize2 } from "lucide-react";
import { useDocStore } from "../store/useDocStore";

export function SlidePresentationModal() {
  const {
    content,
    isPresentationVisible,
    setPresentationVisible,
    currentSlideIndex,
    setCurrentSlideIndex,
    theme,
  } = useDocStore();

  const isDark = theme === "dark";

  // Split content by '---' slide dividers
  const rawSlides = content
    .split(/^---$/m)
    .map((s) => s.trim())
    .filter(Boolean);

  const slides = rawSlides.length > 0 ? rawSlides : [content];
  const totalSlides = slides.length;

  const currentSlideText = slides[Math.min(currentSlideIndex, totalSlides - 1)] || "";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresentationVisible) return;

      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setCurrentSlideIndex(Math.min(currentSlideIndex + 1, totalSlides - 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setCurrentSlideIndex(Math.max(currentSlideIndex - 1, 0));
      } else if (e.key === "Escape") {
        e.preventDefault();
        setPresentationVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresentationVisible, currentSlideIndex, totalSlides, setCurrentSlideIndex, setPresentationVisible]);

  if (!isPresentationVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 animate-in fade-in duration-200 select-none">
      {/* Top Slide Control Ribbon */}
      <header className="h-12 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Presentation className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-xs font-bold tracking-wider uppercase">
            ASTER <span className="text-cyan-400">Presentation Deck</span>
          </span>
        </div>

        {/* Slide Counter */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <span>
            Slide <strong className="text-cyan-400 text-sm">{currentSlideIndex + 1}</strong> of {totalSlides}
          </span>

          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
            <button
              onClick={() => setCurrentSlideIndex(Math.max(currentSlideIndex - 1, 0))}
              disabled={currentSlideIndex === 0}
              className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlideIndex(Math.min(currentSlideIndex + 1, totalSlides - 1))}
              disabled={currentSlideIndex === totalSlides - 1}
              className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={() => setPresentationVisible(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Exit Presentation (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main Slide Screen Container */}
      <main className="flex-1 flex items-center justify-center p-8 md:p-16 overflow-y-auto bg-radial from-slate-900 to-slate-950">
        <div className="w-full max-w-4xl min-h-[60vh] bg-slate-900/70 border border-slate-800/80 rounded-3xl p-10 md:p-16 shadow-2xl backdrop-blur-xl flex flex-col justify-center animate-in zoom-in-95 duration-200">
          <article className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-base md:text-lg">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeHighlight, rehypeKatex]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-6 tracking-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-100 border-b border-slate-800 pb-3 mb-4">
                    {children}
                  </h2>
                ),
                p: ({ children }) => <p className="text-slate-300 text-lg my-3 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="space-y-2 text-slate-300 text-lg list-disc pl-6">{children}</ul>,
                li: ({ children }) => <li className="my-1">{children}</li>,
              }}
            >
              {currentSlideText}
            </ReactMarkdown>
          </article>
        </div>
      </main>

      {/* Bottom Progress Bar */}
      <div className="h-1.5 bg-slate-900 shrink-0">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
        />
      </div>
    </div>
  );
}
