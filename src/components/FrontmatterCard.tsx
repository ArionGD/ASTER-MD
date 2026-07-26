import { Calendar, User, Tag, Info } from "lucide-react";
import { useDocStore } from "../store/useDocStore";

interface FrontmatterCardProps {
  metadata: Record<string, any>;
}

export function FrontmatterCard({ metadata }: FrontmatterCardProps) {
  const { theme } = useDocStore();
  const isDark = theme === "dark";

  if (!metadata || Object.keys(metadata).length === 0) return null;

  const { title, date, author, tags, status, ...rest } = metadata;

  const tagList = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
    ? tags.split(",").map((t) => t.trim())
    : [];

  return (
    <div
      className={`my-6 p-5 rounded-2xl border shadow-xl transition-all ${
        isDark
          ? "bg-slate-900/90 border-slate-800/90 shadow-slate-950/50 text-slate-200"
          : "bg-white border-slate-200 shadow-slate-300/40 text-slate-800"
      }`}
    >
      {/* Frontmatter Title */}
      {title && (
        <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-500 to-indigo-500 bg-clip-text text-transparent">
          {title}
        </h1>
      )}

      {/* Metadata Badges (Author, Date, Status) */}
      <div className="flex flex-wrap items-center gap-4 text-xs mb-3">
        {author && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium text-slate-300">{String(author)}</span>
          </div>
        )}

        {date && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{String(date)}</span>
          </div>
        )}

        {status && (
          <div className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            {String(status)}
          </div>
        )}
      </div>

      {/* Tags */}
      {tagList.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Tag className="w-3.5 h-3.5 text-slate-500 mr-1" />
          {tagList.map((tag: string, idx: number) => (
            <span
              key={idx}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                isDark
                  ? "bg-slate-950/80 border-slate-800 text-cyan-300"
                  : "bg-slate-100 border-slate-300 text-cyan-700"
              }`}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Extra Arbitrary Metadata Fields */}
      {Object.keys(rest).length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-xs">
          {Object.entries(rest).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5 text-[11px]">
              <Info className="w-3 h-3 text-slate-500" />
              <span className="text-slate-400 font-medium capitalize">{key}:</span>
              <span className="text-slate-300 truncate">{String(val)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
