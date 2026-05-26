import { useEffect, useRef, useState } from "react";
import type { HandoverRuleResponse } from "@/types/api";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { TriggerTypeIcon } from "./TriggerTypeIcon";
import {
  CONDITION_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
  canActivateRule,
  canEditRule,
  canPauseRule,
  canTriggerRule,
  conditionIconColor,
  conditionSummary,
} from "./ruleMeta";

interface Props {
  rule: HandoverRuleResponse;
  busy?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onActivate: () => void;
  onPause: () => void;
  onTrigger: () => void;
}

export function RuleCard({
  rule,
  busy = false,
  onEdit,
  onDelete,
  onActivate,
  onPause,
  onTrigger,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const colors = conditionIconColor(rule.conditionType);

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
      <div className="flex items-start gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.fg}`}
        >
          <TriggerTypeIcon type={rule.conditionType} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="flex-1 truncate text-sm font-semibold text-slate-100">
              {rule.title}
            </h3>
            <Badge tone={STATUS_TONE[rule.status]}>
              {STATUS_LABEL[rule.status]}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            {CONDITION_LABEL[rule.conditionType]} ·{" "}
            {conditionSummary(rule.conditionType, rule.conditionValue)}
          </p>
          {rule.description && (
            <p className="mt-2 line-clamp-2 text-xs text-slate-500">
              {rule.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-slate-400">
            <span className="rounded-md border border-slate-700/60 bg-slate-800/40 px-2 py-0.5">
              자산 {rule.assets.length}개
            </span>
            <span className="rounded-md border border-slate-700/60 bg-slate-800/40 px-2 py-0.5">
              수신자 {rule.recipients.length}명
            </span>
          </div>
        </div>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
            aria-label="더보기"
            disabled={busy}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19" cy="12" r="1.8" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-32 overflow-hidden rounded-md border border-slate-700 bg-slate-900 shadow-xl">
              {canEditRule(rule.status) && (
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
              )}
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

      {/* 액션 버튼: 상태별 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {canTriggerRule(rule.status) && (
          <Button
            variant="danger"
            size="sm"
            onClick={onTrigger}
            disabled={busy}
          >
            즉시 실행
          </Button>
        )}
        {canActivateRule(rule.status) && (
          <Button
            variant="primary"
            size="sm"
            onClick={onActivate}
            disabled={busy}
          >
            활성화
          </Button>
        )}
        {canPauseRule(rule.status) && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPause}
            disabled={busy}
          >
            일시정지
          </Button>
        )}
        {rule.status === "DRAFT" && (
          <span className="text-xs text-slate-500 self-center">
            초안 상태. 활성화 시 평가 시작됩니다.
          </span>
        )}
      </div>
    </div>
  );
}
