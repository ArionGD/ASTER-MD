import { AccentColor } from "../store/useDocStore";

export interface AccentTheme {
  text: string;
  textHover: string;
  bg: string;
  bgHover: string;
  bgSoft: string;
  border: string;
  borderSoft: string;
  ring: string;
  gradient: string;
  btn: string;
  hex: string;
}

export function getAccentClasses(accent: AccentColor): AccentTheme {
  switch (accent) {
    case "emerald":
      return {
        text: "text-emerald-400",
        textHover: "hover:text-emerald-300",
        bg: "bg-emerald-500",
        bgHover: "hover:bg-emerald-400",
        bgSoft: "bg-emerald-500/15",
        border: "border-emerald-500",
        borderSoft: "border-emerald-500/40",
        ring: "ring-emerald-500/30",
        gradient: "from-emerald-400 to-teal-400",
        btn: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold",
        hex: "#10b981",
      };
    case "violet":
      return {
        text: "text-violet-400",
        textHover: "hover:text-violet-300",
        bg: "bg-violet-500",
        bgHover: "hover:bg-violet-400",
        bgSoft: "bg-violet-500/15",
        border: "border-violet-500",
        borderSoft: "border-violet-500/40",
        ring: "ring-violet-500/30",
        gradient: "from-violet-400 to-purple-400",
        btn: "bg-violet-500 hover:bg-violet-400 text-slate-950 font-semibold",
        hex: "#8b5cf6",
      };
    case "amber":
      return {
        text: "text-amber-400",
        textHover: "hover:text-amber-300",
        bg: "bg-amber-500",
        bgHover: "hover:bg-amber-400",
        bgSoft: "bg-amber-500/15",
        border: "border-amber-500",
        borderSoft: "border-amber-500/40",
        ring: "ring-amber-500/30",
        gradient: "from-amber-400 to-orange-400",
        btn: "bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold",
        hex: "#f59e0b",
      };
    case "rose":
      return {
        text: "text-rose-400",
        textHover: "hover:text-rose-300",
        bg: "bg-rose-500",
        bgHover: "hover:bg-rose-400",
        bgSoft: "bg-rose-500/15",
        border: "border-rose-500",
        borderSoft: "border-rose-500/40",
        ring: "ring-rose-500/30",
        gradient: "from-rose-400 to-pink-400",
        btn: "bg-rose-500 hover:bg-rose-400 text-slate-950 font-semibold",
        hex: "#f43f5e",
      };
    case "cyan":
    default:
      return {
        text: "text-cyan-400",
        textHover: "hover:text-cyan-300",
        bg: "bg-cyan-500",
        bgHover: "hover:bg-cyan-400",
        bgSoft: "bg-cyan-500/15",
        border: "border-cyan-500",
        borderSoft: "border-cyan-500/40",
        ring: "ring-cyan-500/30",
        gradient: "from-cyan-400 to-indigo-400",
        btn: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold",
        hex: "#06b6d4",
      };
  }
}
