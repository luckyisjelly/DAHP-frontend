import { useEffect, useRef, useState } from "react";
import type { AssetResponse } from "@/types/api";
import { Badge } from "@/components/Badge";
import { AssetTypeIcon } from "./AssetTypeIcon";
import {
  ASSET_TYPE_LABEL,
  SENSITIVITY_LABEL,
  SENSITIVITY_TONE,
  assetTypeColor,
} from "./assetMeta";

interface Props {
  asset: AssetResponse;
  onEdit: () => void;
  onDelete: () => void;
}

export function AssetCard({ asset, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const colors = assetTypeColor(asset.type);

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

  const created = new Date(asset.createdAt);
  const createdStr = `${created.getFullYear()}-${String(
    created.getMonth() + 1,
  ).padStart(2, "0")}-${String(created.getDate()).padStart(2, "0")}`;

  return (
    <div className="group relative rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-colors hover:border-slate-700">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.iconBg}`}
        >
          <AssetTypeIcon type={asset.type} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-100">
            {asset.title}
          </h3>
          <p className={`text-xs ${colors.fg}`}>
            {ASSET_TYPE_LABEL[asset.type]}
          </p>
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
      {asset.description && (
        <p className="mt-3 line-clamp-2 text-xs text-slate-400">
          {asset.description}
        </p>
      )}
      <div className="mt-4 flex items-center justify-between">
        <Badge tone={SENSITIVITY_TONE[asset.sensitivityLevel]}>
          {SENSITIVITY_LABEL[asset.sensitivityLevel]}
        </Badge>
        <span className="text-xs text-slate-500">{createdStr}</span>
      </div>
    </div>
  );
}
