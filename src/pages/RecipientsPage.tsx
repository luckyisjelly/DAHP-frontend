import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RecipientCard } from "@/components/recipients/RecipientCard";
import { RecipientFormModal } from "@/components/recipients/RecipientFormModal";
import { deleteRecipient, listRecipients } from "@/api/recipients";
import { ApiError } from "@/api/client";
import type { PageResponse, RecipientResponse } from "@/types/api";

const PAGE_SIZE = 12;

export function RecipientsPage() {
  const [page, setPage] = useState<PageResponse<RecipientResponse> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [pageIdx, setPageIdx] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RecipientResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RecipientResponse | null>(
    null,
  );

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listRecipients({
        q: q || undefined,
        page: pageIdx,
        size: PAGE_SIZE,
        sort: "createdAt,desc",
      });
      setPage(res);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("수신자 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [q, pageIdx]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (qInput !== q) {
        setQ(qInput);
        setPageIdx(0);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [qInput, q]);

  const handleSaved = () => {
    setPageIdx(0);
    fetchList();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteRecipient(deleteTarget.id);
    setDeleteTarget(null);
    fetchList();
  };

  const items = page?.content ?? [];
  const isEmptyFiltered = !loading && items.length === 0 && q;
  const isEmptyAll = !loading && items.length === 0 && !q;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">수신자</h2>
          <p className="mt-1 text-sm text-slate-400">
            자산을 전달받을 수신자(가족, 친구 등)를 관리하세요.
          </p>
        </div>
        <Button
          variant="success"
          onClick={() => {
            setEditTarget(null);
            setFormOpen(true);
          }}
        >
          + 수신자 추가
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="ml-auto w-full sm:w-64">
          <input
            type="search"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="이름으로 검색..."
            className="w-full rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500"
          />
        </div>
      </div>

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
          {items.map((r) => (
            <RecipientCard
              key={r.id}
              recipient={r}
              onEdit={() => {
                setEditTarget(r);
                setFormOpen(true);
              }}
              onDelete={() => setDeleteTarget(r)}
            />
          ))}
        </div>
      )}

      {isEmptyAll && (
        <EmptyState
          title="아직 수신자가 없습니다"
          description="자산을 전달받을 가족이나 친구를 먼저 등록하세요."
          action={
            <Button
              variant="success"
              onClick={() => {
                setEditTarget(null);
                setFormOpen(true);
              }}
            >
              + 첫 수신자 추가하기
            </Button>
          }
        />
      )}

      {isEmptyFiltered && (
        <EmptyState
          title="검색 결과가 없습니다"
          description="다른 이름으로 검색해보세요."
        />
      )}

      {page && page.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <span>
            전체 {page.totalElements}명 · {page.page + 1} / {page.totalPages}{" "}
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

      <RecipientFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        recipient={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="수신자 삭제"
        description={
          deleteTarget
            ? `"${deleteTarget.name}"님을 수신자 목록에서 삭제합니다. 이 작업은 되돌릴 수 없으며, 이 수신자가 포함된 인계 규칙이 있다면 해당 규칙도 영향을 받을 수 있습니다.`
            : ""
        }
        confirmLabel="삭제"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
