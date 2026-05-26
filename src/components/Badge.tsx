import { clsx } from "clsx";
import type { ReactNode } from "react";

type Tone = "neutral" | "violet" | "blue" | "green" | "yellow" | "red" | "slate";

const toneClass: Record<Tone, string> = {
  neutral: "bg-slate-700/40 text-slate-300 border-slate-600/40",
  violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  blue: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  green: "bg-green-500/15 text-green-300 border-green-500/30",
  yellow: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  red: "bg-red-500/15 text-red-300 border-red-500/30",
  slate: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

interface Props {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

export function Badge({ children, tone = "neutral", className }: Props) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
