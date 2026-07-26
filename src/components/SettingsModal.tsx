import { X, Palette, Type, Sparkles, Check } from "lucide-react";
import {
  useDocStore,
  AccentColor,
  ProseFont,
  CodeFont,
} from "../store/useDocStore";
import { getAccentClasses } from "../utils/themeAccent";

export function SettingsModal() {
  const {
    isSettingsOpen,
    toggleSettings,
    theme,
    accentColor,
    setAccentColor,
    proseFont,
    setProseFont,
    codeFont,
    setCodeFont,
  } = useDocStore();

  if (!isSettingsOpen) return null;

  const isDark = theme === "dark";
  const accent = getAccentClasses(accentColor);

  const accentOptions: { name: AccentColor; label: string; bg: string }[] = [
    { name: "cyan", label: "Celestial Cyan", bg: "bg-cyan-500" },
    { name: "emerald", label: "Emerald Glow", bg: "bg-emerald-500" },
    { name: "violet", label: "Deep Violet", bg: "bg-violet-500" },
    { name: "amber", label: "Warm Amber", bg: "bg-amber-500" },
    { name: "rose", label: "Rose Cosmic", bg: "bg-rose-500" },
  ];

  const proseFontOptions: ProseFont[] = ["Inter", "Roboto", "Outfit", "System"];
  const codeFontOptions: CodeFont[] = ["JetBrains Mono", "Fira Code"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden p-6 transition-all ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/80"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-400/30"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${accent.bgSoft} flex items-center justify-center`}>
              <Sparkles className={`w-4 h-4 ${accent.text}`} />
            </div>
            <h2 className="text-base font-bold tracking-tight">Theme & Styling Customization</h2>
          </div>

          <button
            onClick={toggleSettings}
            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Accent Color Picker */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Palette className={`w-3.5 h-3.5 ${accent.text}`} />
            <span>Accent Theme Color</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {accentOptions.map((opt) => {
              const isSelected = accentColor === opt.name;
              const optAccent = getAccentClasses(opt.name);
              return (
                <button
                  key={opt.name}
                  onClick={() => setAccentColor(opt.name)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? `${optAccent.borderSoft} ${optAccent.bgSoft} ring-2 ${optAccent.ring}`
                      : "border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/50"
                  }`}
                  title={opt.label}
                >
                  <div className={`w-5 h-5 rounded-full ${opt.bg} shadow-md flex items-center justify-center`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-[10px] capitalize font-medium text-slate-300">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Prose Typography Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Type className={`w-3.5 h-3.5 ${accent.text}`} />
            <span>Prose Typography Font</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {proseFontOptions.map((font) => {
              const isSelected = proseFont === font;
              return (
                <button
                  key={font}
                  onClick={() => setProseFont(font)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all text-left flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? `${accent.borderSoft} ${accent.bgSoft} ${accent.text} font-semibold`
                      : "border-slate-800/80 bg-slate-950/40 text-slate-300 hover:bg-slate-800/50"
                  }`}
                  style={{ fontFamily: font === "System" ? "sans-serif" : font }}
                >
                  <span>{font}</span>
                  {isSelected && <Check className={`w-3.5 h-3.5 ${accent.text}`} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Monospace Code Font Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Type className={`w-3.5 h-3.5 ${accent.text}`} />
            <span>Code Monospace Font</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {codeFontOptions.map((font) => {
              const isSelected = codeFont === font;
              return (
                <button
                  key={font}
                  onClick={() => setCodeFont(font)}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono transition-all text-left flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? `${accent.borderSoft} ${accent.bgSoft} ${accent.text} font-semibold`
                      : "border-slate-800/80 bg-slate-950/40 text-slate-300 hover:bg-slate-800/50"
                  }`}
                  style={{ fontFamily: font }}
                >
                  <span>{font}</span>
                  {isSelected && <Check className={`w-3.5 h-3.5 ${accent.text}`} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800/60 flex justify-end">
          <button
            onClick={toggleSettings}
            className={`px-4 py-1.5 rounded-xl ${accent.btn} text-xs transition-colors cursor-pointer`}
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
