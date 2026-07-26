import { useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";
import { useDocStore } from "../store/useDocStore";

interface CodeBlockProps {
  language?: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { theme } = useDocStore();
  const isDark = theme === "dark";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy code snippet", e);
    }
  };

  return (
    <div className={`relative group my-4 rounded-xl border overflow-hidden shadow-lg ${
      isDark ? "border-slate-800/80 bg-slate-900/90 shadow-slate-950/40" : "border-slate-300 bg-slate-900 text-slate-100 shadow-slate-300/40"
    }`}>
      {/* Code Header Bar */}
      <div className={`flex items-center justify-between px-4 py-1.5 border-b text-xs font-mono select-none ${
        isDark ? "bg-slate-950/80 border-slate-800/70 text-slate-400" : "bg-slate-950 border-slate-800 text-slate-400"
      }`}>
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 font-medium uppercase tracking-wider text-[11px]">
            {language || "code"}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 hover:border-slate-700 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-slate-200 selection:bg-cyan-500/30">
        <pre className="!bg-transparent !p-0 !m-0">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
}
