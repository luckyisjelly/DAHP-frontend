import { useEffect, useRef, useState } from "react";
import type { RecipientResponse } from "@/types/api";
import { Badge } from "@/components/Badge";
import {
  avatarColor,
  avatarInitials,
  relationshipTone,
} from "./recipientMeta";

interface Props {
  recipient: RecipientResponse;
  onEdit: () => void;
  onDelete: () => void;
}

export function RecipientCard({ recipient, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatar = avatarColor(recipient.name);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  return (
    <div className="group relative rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-colors hover:border-slate-700">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatar.bg} ${avatar.fg}`}
        >
          {avatarInitials(recipient.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-100">
            {recipient.name}
          </h3>
          <p className="truncate text-xs text-slate-400">{recipient.email}</p>
        </div>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
            aria-label="더보기"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19" cy="12" r="1.8" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-32 overflow-hidden rounded-md border border-slate-700 bg-slate-900 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
                className="block w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800"
              >
                편집
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="block w-full border-t border-slate-800 px-3 py-2 text-left text-xs text-red-400 hover:bg-slate-800"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {recipient.relationship && (
          <Badge tone={relationshipTone(recipient.relationship)}>
            {recipient.relationship}
          </Badge>
        )}
        {recipient.phone && (
          <Badge tone="neutral">{recipient.phone}</Badge>
        )}
      </div>

      {recipient.memo && (
        <p className="mt-3 line-clamp-2 text-xs text-slate-400">
          {recipient.memo}
        </p>
      )}
    </div>
  );
}
