import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { Button } from "@/components/Button";
import { getCheckInStatus, performCheckIn } from "@/api/checkin";
import { ApiError } from "@/api/client";
import type { CheckInStatusResponse } from "@/types/api";

type Tone = "ok" | "warn" | "urgent";

function getTone(status: CheckInStatusResponse): Tone {
  if (status.overdue || status.daysUntilDue <= 1) return "urgent";
  if (status.daysUntilDue <= 7) return "warn";
  return "ok";
}

const toneStyles: Record<
  Tone,
  {
    cardBg: string;
    ringBg: string;
    progressBg: string;
    progressFill: string;
    accentText: string;
    glow: string;
    button: "primary" | "danger";
    label: string;
  }
> = {
  ok: {
    cardBg: "from-violet-500/10 via-violet-500/5 to-blue-500/10",
    ringBg: "ring-violet-500/20",
    progressBg: "bg-slate-700/50",
    progressFill: "bg-gradient-to-r from-violet-500 to-blue-500",
    accentText: "text-violet-300",
    glow: "shadow-violet-500/20",
    button: "primary",
    label: "다음 체크인까지",
  },
  warn: {
    cardBg: "from-yellow-500/15 via-orange-500/10 to-yellow-500/5",
    ringBg: "ring-yellow-500/30",
    progressBg: "bg-slate-700/50",
    progressFill: "bg-gradient-to-r from-yellow-500 to-orange-500",
    accentText: "text-yellow-300",
    glow: "shadow-yellow-500/20",
    button: "primary",
    label: "다음 체크인까지",
  },
  urgent: {
    cardBg: "from-red-500/20 via-red-500/10 to-red-500/5",
    ringBg: "ring-red-500/40",
    progressBg: "bg-slate-700/50",
    progressFill: "bg-gradient-to-r from-red-500 to-orange-500",
    accentText: "text-red-300",
    glow: "shadow-red-500/30",
    button: "danger",
    label: "체크인 만료 상태",
  },
};

function formatLastCheckIn(iso: string | null): string {
  if (!iso) return "기록 없음";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}년 ${m}월 ${day}일 ${hh}:${mm}`;
}

export function CheckInWidget() {
  const [status, setStatus] = useState<CheckInStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setError(null);
    try {
      const s = await getCheckInStatus();
      setStatus(s);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("체크인 상태를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleCheckIn = async () => {
    setError(null);
    setChecking(true);
    try {
      const updated = await performCheckIn();
      setStatus(updated);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("체크인 처리 중 오류가 발생했습니다.");
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="h-32 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40" />
    );
  }

  if (error && !status) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (!status) return null;

  const tone = getTone(status);
  const style = toneStyles[tone];

  // 진행도 계산: 경과일 / 전체 주기 (0~100, overdue면 100)
  const elapsed = status.checkInIntervalDays - status.daysUntilDue;
  const percent = status.overdue
    ? 100
    : Math.min(
        100,
        Math.max(0, (elapsed / status.checkInIntervalDays) * 100),
      );

  const daysText = status.overdue
    ? `${Math.abs(status.daysUntilDue)}일 지남`
    : `${status.daysUntilDue}일`;

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br p-6 ring-1",
        style.cardBg,
        style.ringBg,
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        {/* 좌측: 라벨 + 카운트 */}
        <div className="min-w-0 flex-1">
          <p className={clsx("text-xs font-medium uppercase tracking-wide", style.accentText)}>
            {style.label}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-50 sm:text-5xl">
              {daysText}
            </span>
            {status.overdue && (
              <span className="text-sm text-red-300">자동 트리거 위험</span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            마지막 체크인: {formatLastCheckIn(status.lastCheckInAt)} · 주기{" "}
            {status.checkInIntervalDays}일
          </p>
        </div>

        {/* 가운데: 진행도 바 */}
        <div className="hidden flex-1 sm:block">
          <div
            className={clsx(
              "h-2 w-full overflow-hidden rounded-full",
              style.progressBg,
            )}
          >
            <div
              className={clsx("h-full transition-all", style.progressFill)}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
            <span>0일</span>
            <span>{status.checkInIntervalDays}일</span>
          </div>
        </div>

        {/* 우측: 체크인 버튼 */}
        <Button
          variant={style.button}
          size="lg"
          onClick={handleCheckIn}
          disabled={checking}
          className={clsx("shrink-0 shadow-lg", style.glow)}
        >
          {checking ? "체크인 중..." : "지금 체크인"}
        </Button>
      </div>

      {error && status && (
        <p className="mt-3 text-xs text-red-300">{error}</p>
      )}
    </div>
  );
}
