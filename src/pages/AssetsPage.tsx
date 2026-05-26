import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AssetCard } from "@/components/assets/AssetCard";
import { AssetFormModal } from "@/components/assets/AssetFormModal";
import {
  ASSET_TYPE_LABEL,
  VISIBLE_ASSET_TYPES,
} from "@/components/assets/assetMeta";
import { deleteAsset, listAssets } from "@/api/assets";
import { ApiError } from "@/api/client";
import type { AssetResponse, AssetType, PageResponse } from "@/types/api";

const PAGE_SIZE = 12;

export function AssetsPage() {
  const [page, setPage] = useState<PageResponse<AssetResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssetType | null>(null);
  const [pageIdx, setPageIdx] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AssetResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AssetResponse | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAssets({
        type: typeFilter ?? undefined,
        q: q || undefined,
        page: pageIdx,
        size: PAGE_SIZE,
        sort: "createdAt,desc",
      });
      setPage(res);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("자산 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, q, pageIdx]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 검색 입력 debounce
  useEffect(() => {
    const t = setTimeout(() => {
      if (qInput !== q) {
        setQ(qInput);
        setPageIdx(0);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [qInput, q]);

  const handleSaved = (_saved: AssetResponse) => {
    setPageIdx(0);
    fetchList();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteAsset(deleteTarget.id);
    setDeleteTarget(null);
    fetchList();
  };

  const items = page?.content ?? [];
  const isEmptyFiltered =
    !loading && items.length === 0 && (q || typeFilter);
  const isEmptyAll = !loading && items.length === 0 && !q && !typeFilter;

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">자산</h2>
          <p className="mt-1 text-sm text-slate-400">
            계정, 파일, 메시지를 등록하고 안전하게 보관하세요.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditTarget(null);
            setFormOpen(true);
          }}
        >
          + 자산 등록
        </Button>
      </div>

      {/* 필터 / 검색 */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <FilterChip
          active={typeFilter === null}
          onClick={() => {
            setTypeFilter(null);
            setPageIdx(0);
          }}
        >
          전체
        </FilterChip>
        {VISIBLE_ASSET_TYPES.map((t) => (
          <FilterChip
            key={t}
            active={typeFilter === t}
            onClick={() => {
              setTypeFilter(t);
              setPageIdx(0);
            }}
          >
            {ASSET_TYPE_LABEL[t]}
          </FilterChip>
        ))}
        <div className="ml-auto w-full sm:w-64">
          <input
            type="search"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="자산 검색..."
            className="w-full rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* 본문 */}
      {error && (
        <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40"
            />
          ))}
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <AssetCard
              key={a.id}
              asset={a}
              onEdit={() => {
                setEditTarget(a);
                setFormOpen(true);
              }}
              onDelete={() => setDeleteTarget(a)}
            />
          ))}
        </div>
      )}

      {isEmptyAll && (
        <EmptyState
          title="아직 등록된 자산이 없습니다"
          description="첫 자산을 등록해 안전하게 보관하세요."
          action={
            <Button
              onClick={() => {
                setEditTarget(null);
                setFormOpen(true);
              }}
            >
              + 첫 자산 등록하기
            </Button>
          }
        />
      )}

      {isEmptyFiltered && (
        <EmptyState
          title="조건에 맞는 자산이 없습니다"
          description="검색어나 필터를 변경해보세요."
        />
      )}

      {/* 페이지네이션 */}
      {page && page.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <span>
            전체 {page.totalElements}건 · {page.page + 1} / {page.totalPages}{" "}
            페이지
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page.first}
              onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
            >
              이전
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page.last}
              onClick={() => setPageIdx((p) => p + 1)}
            >
              다음
            </Button>
          </div>
        </div>
      )}

      <AssetFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        asset={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="자산 삭제"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" 자산을 삭제합니다. 이 작업은 되돌릴 수 없습니다.`
            : ""
        }
        confirmLabel="삭제"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-md border px-3 py-1.5 text-xs transition-colors",
        active
          ? "border-violet-500 bg-violet-500/10 text-violet-300"
          : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-200",
      )}
    >
      {children}
    </button>
  );
}
