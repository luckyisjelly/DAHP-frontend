import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RuleCard } from "@/components/rules/RuleCard";
import { RuleFormModal } from "@/components/rules/RuleFormModal";
import { STATUS_TABS } from "@/components/rules/ruleMeta";
import {
  activateRule,
  deleteRule,
  listRules,
  pauseRule,
  triggerRule,
} from "@/api/rules";
import { ApiError } from "@/api/client";
import type {
  HandoverRuleResponse,
  HandoverRuleStatus,
  PageResponse,
} from "@/types/api";

const PAGE_SIZE = 12;

export function RulesPage() {
  const [page, setPage] = useState<PageResponse<HandoverRuleResponse> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<HandoverRuleStatus | null>(
    null,
  );
  const [pageIdx, setPageIdx] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<HandoverRuleResponse | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<HandoverRuleResponse | null>(
    null,
  );
  const [triggerTarget, setTriggerTarget] =
    useState<HandoverRuleResponse | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listRules({
        status: statusFilter ?? undefined,
        page: pageIdx,
        size: PAGE_SIZE,
        sort: "createdAt,desc",
      });
      setPage(res);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("인계 규칙 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, pageIdx]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 토스트 자동 사라짐
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSaved = () => {
    setPageIdx(0);
    fetchList();
  };

  const handleActivate = async (rule: HandoverRuleResponse) => {
    setBusyId(rule.id);
    try {
      await activateRule(rule.id);
      setToast(`"${rule.title}" 활성화됨`);
      fetchList();
    } catch (err) {
      setToast(err instanceof ApiError ? err.message : "활성화 실패");
    } finally {
      setBusyId(null);
    }
  };

  const handlePause = async (rule: HandoverRuleResponse) => {
    setBusyId(rule.id);
    try {
      await pauseRule(rule.id);
      setToast(`"${rule.title}" 일시정지됨`);
      fetchList();
    } catch (err) {
      setToast(err instanceof ApiError ? err.message : "일시정지 실패");
    } finally {
      setBusyId(null);
    }
  };

  const handleTriggerConfirm = async () => {
    if (!triggerTarget) return;
    setBusyId(triggerTarget.id);
    try {
      const res = await triggerRule(triggerTarget.id);
      setToast(
        `"${triggerTarget.title}" 트리거 완료. ${res.eventCount}건의 인계 이벤트 생성됨`,
      );
      setTriggerTarget(null);
      fetchList();
    } catch (err) {
      setToast(err instanceof ApiError ? err.message : "트리거 실패");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteRule(deleteTarget.id);
    setDeleteTarget(null);
    fetchList();
  };

  const items = page?.content ?? [];
  const isEmptyFiltered = !loading && items.length === 0 && statusFilter;
  const isEmptyAll = !loading && items.length === 0 && !statusFilter;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">인계 규칙</h2>
          <p className="mt-1 text-sm text-slate-400">
            어떤 조건에서 누구에게 어떤 자산을 전달할지 정의합니다.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditTarget(null);
            setFormOpen(true);
          }}
        >
          + 새 규칙 만들기
        </Button>
      </div>

      {/* 상태 필터 탭 */}
      <div className="mb-5 flex flex-wrap items-center gap-2 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value ?? "all"}
            type="button"
            onClick={() => {
              setStatusFilter(tab.value);
              setPageIdx(0);
            }}
            className={clsx(
              "rounded-md border px-3 py-1.5 text-xs transition-colors",
              statusFilter === tab.value
                ? "border-violet-500 bg-violet-500/10 text-violet-300"
                : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-200",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40"
            />
          ))}
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((r) => (
            <RuleCard
              key={r.id}
              rule={r}
              busy={busyId === r.id}
              onEdit={() => {
                setEditTarget(r);
                setFormOpen(true);
              }}
              onDelete={() => setDeleteTarget(r)}
              onActivate={() => handleActivate(r)}
              onPause={() => handlePause(r)}
              onTrigger={() => setTriggerTarget(r)}
            />
          ))}
        </div>
      )}

      {isEmptyAll && (
        <EmptyState
          title="아직 등록된 인계 규칙이 없습니다"
          description="자산을 안전하게 전달하기 위한 첫 규칙을 만들어보세요."
          action={
            <Button
              onClick={() => {
                setEditTarget(null);
                setFormOpen(true);
              }}
            >
              + 첫 규칙 만들기
            </Button>
          }
        />
      )}

      {isEmptyFiltered && (
        <EmptyState
          title="이 상태의 규칙이 없습니다"
          description="다른 상태 탭을 확인해보세요."
        />
      )}

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

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900/95 px-4 py-3 text-sm text-slate-100 shadow-2xl backdrop-blur">
          {toast}
        </div>
      )}

      <RuleFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        rule={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="규칙 삭제"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" 규칙을 삭제합니다. 이 작업은 되돌릴 수 없습니다.`
            : ""
        }
        confirmLabel="삭제"
        variant="danger"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!triggerTarget}
        onClose={() => setTriggerTarget(null)}
        title="규칙 즉시 실행"
        description={
          triggerTarget
            ? `"${triggerTarget.title}" 규칙을 지금 트리거합니다. 자산 ${triggerTarget.assets.length}개 × 수신자 ${triggerTarget.recipients.length}명 조합으로 인계 이벤트가 생성됩니다. 이 작업은 즉시 효력이 발생합니다.`
            : ""
        }
        confirmLabel="실행"
        variant="danger"
        onConfirm={handleTriggerConfirm}
      />
    </div>
  );
}
