import { useMemo, useState } from "react";
import { clsx } from "clsx";

export interface PickerItem {
  id: number;
  label: string;
  subtitle?: string;
  badge?: string;
}

interface Props {
  items: PickerItem[];
  selected: number[];
  onChange: (ids: number[]) => void;
  emptyText: string;
  searchPlaceholder?: string;
  loading?: boolean;
}

export function MultiSelectPicker({
  items,
  selected,
  onChange,
  emptyText,
  searchPlaceholder = "검색...",
  loading,
}: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(needle) ||
        it.subtitle?.toLowerCase().includes(needle),
    );
  }, [items, q]);

  const toggle = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-md border border-slate-800 bg-slate-900/40"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-700 bg-slate-900/30 px-4 py-6 text-center text-sm text-slate-400">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500"
      />
      <div className="max-h-56 overflow-y-auto rounded-md border border-slate-800 bg-slate-950/40">
        {filtered.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-slate-500">
            검색 결과 없음
          </p>
        ) : (
          <ul>
            {filtered.map((it) => {
              const isOn = selected.includes(it.id);
              return (
                <li key={it.id}>
                  <button
                    type="button"
                    onClick={() => toggle(it.id)}
                    className={clsx(
                      "flex w-full items-center justify-between gap-2 border-b border-slate-800/60 px-3 py-2 text-left text-sm transition-colors last:border-b-0",
                      isOn
                        ? "bg-violet-500/10 text-violet-100"
                        : "text-slate-200 hover:bg-slate-800/40",
                    )}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <span
                        className={clsx(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          isOn
                            ? "border-violet-400 bg-violet-500 text-white"
                            : "border-slate-600 bg-transparent",
                        )}
                      >
                        {isOn && (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{it.label}</span>
                        {it.subtitle && (
                          <span className="block truncate text-xs text-slate-500">
                            {it.subtitle}
                          </span>
                        )}
                      </span>
                    </span>
                    {it.badge && (
                      <span className="shrink-0 rounded-md border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 text-[10px] text-slate-400">
                        {it.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="text-xs text-slate-500">선택됨: {selected.length}개</p>
    </div>
  );
}
