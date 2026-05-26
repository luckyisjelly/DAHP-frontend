import { useEffect, type ReactNode } from "react";
import { clsx } from "clsx";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  footer?: ReactNode;
}

const sizeClass = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
} as const;

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={clsx(
          "relative w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl",
          sizeClass[size],
        )}
      >
        <div className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="border-t border-slate-800 bg-slate-900/80 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
