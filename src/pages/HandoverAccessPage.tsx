import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { AssetTypeIcon } from "@/components/assets/AssetTypeIcon";
import {
  ASSET_TYPE_LABEL,
  SENSITIVITY_LABEL,
  SENSITIVITY_TONE,
  assetTypeColor,
} from "@/components/assets/assetMeta";
import { fetchHandoverAccess } from "@/api/handover-access";
import { ApiError } from "@/api/client";
import type { HandoverAccessResponse } from "@/types/api";

type Stage =
  | { kind: "intro" }
  | { kind: "loading" }
  | { kind: "revealed"; data: HandoverAccessResponse }
  | { kind: "error"; code: string; message: string; hint?: string };

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}년 ${m}월 ${day}일 ${hh}:${mm}`;
}

function errorTitle(code: string): string {
  switch (code) {
    case "INVALID_ACCESS_TOKEN":
      return "유효하지 않은 링크입니다";
    case "ACCESS_TOKEN_EXPIRED":
      return "링크가 만료되었습니다";
    case "ACCESS_TOKEN_USED":
      return "이미 열람한 링크입니다";
    case "ACCESS_TOKEN_CANCELLED":
      return "전달이 취소된 자산입니다";
    default:
      return "자산을 불러올 수 없습니다";
  }
}

export function HandoverAccessPage() {
  const { token } = useParams<{ token: string }>();
  const [stage, setStage] = useState<Stage>({ kind: "intro" });

  const reveal = async () => {
    if (!token) return;
    setStage({ kind: "loading" });
    try {
      const data = await fetchHandoverAccess(token);
      setStage({ kind: "revealed", data });
    } catch (err) {
      if (err instanceof ApiError) {
        setStage({
          kind: "error",
          code: err.code,
          message: err.message,
          hint: err.hint ?? undefined,
        });
      } else {
        setStage({
          kind: "error",
          code: "UNKNOWN",
          message: "네트워크 오류가 발생했습니다.",
        });
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-slate-100">
      {/* 배경 그라데이션 */}
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-30">
        <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* 로고 */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-base font-bold text-white">
            D
          </span>
          <span className="text-lg font-semibold text-slate-200">DAHP</span>
        </div>

        {stage.kind === "intro" && <IntroView onReveal={reveal} />}
        {stage.kind === "loading" && <LoadingView />}
        {stage.kind === "revealed" && <RevealedView data={stage.data} />}
        {stage.kind === "error" && (
          <ErrorView
            title={errorTitle(stage.code)}
            message={stage.message}
            hint={stage.hint}
          />
        )}

        <p className="mt-8 text-center text-xs text-slate-500">
          이 페이지의 모든 접근은 보안 로그에 기록됩니다.
        </p>
      </div>
    </div>
  );
}

function IntroView({ onReveal }: { onReveal: () => void }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-violet-400">
        DAHP 자산 전달
      </p>
      <h1 className="text-2xl font-semibold text-slate-50">
        당신에게 전달된 자산이 있습니다
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">
        소유자가 미리 설정한 조건에 따라 디지털 자산이 당신에게 전달되었습니다.
        아래 버튼을 누르면 내용을 확인할 수 있습니다.
      </p>

      <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-amber-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          1회만 열람 가능
        </p>
        <p className="mt-1 text-xs text-amber-200/80">
          버튼을 누르면 즉시 내용이 표시되며, 같은 링크로 다시 접근할 수 없습니다.
          반드시 내용을 저장하거나 화면을 캡쳐한 후 페이지를 닫아주세요.
        </p>
      </div>

      <Button
        size="lg"
        onClick={onReveal}
        className="mt-6 w-full"
      >
        내용 열람하기
      </Button>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-12 text-center shadow-2xl backdrop-blur">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500" />
      <p className="mt-4 text-sm text-slate-400">자산을 안전하게 불러오는 중...</p>
    </div>
  );
}

function RevealedView({ data }: { data: HandoverAccessResponse }) {
  const { asset, rule, owner, expiresAt, notice } = data;
  const colors = assetTypeColor(asset.type);

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 카드 */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
        <p className="text-xs font-medium uppercase tracking-wide text-violet-400">
          전달자
        </p>
        <p className="mt-1 text-base font-semibold text-slate-100">{owner.email}</p>
        <p className="mt-3 text-sm text-slate-400">
          소유자가 설정한 규칙{" "}
          <span className="font-medium text-slate-200">"{rule.title}"</span>에
          따라 다음 자산이 당신에게 전달되었습니다.
        </p>
      </div>

      {/* 자산 카드 */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
        <div className="flex items-start gap-4">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${colors.iconBg}`}
          >
            <AssetTypeIcon type={asset.type} size={28} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-50">
                {asset.title}
              </h2>
              <Badge tone={SENSITIVITY_TONE[asset.sensitivityLevel]}>
                {SENSITIVITY_LABEL[asset.sensitivityLevel]}
              </Badge>
            </div>
            <p className={`mt-0.5 text-sm ${colors.fg}`}>
              {ASSET_TYPE_LABEL[asset.type]}
            </p>
          </div>
        </div>

        {asset.description && (
          <div className="mt-5">
            <p className="text-xs font-medium text-slate-400">설명</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-200">
              {asset.description}
            </p>
          </div>
        )}

        {asset.externalRef && (
          <div className="mt-5">
            <p className="text-xs font-medium text-slate-400">링크</p>
            <a
              href={asset.externalRef}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex break-all text-sm text-violet-400 underline-offset-2 hover:text-violet-300 hover:underline"
            >
              {asset.externalRef}
            </a>
          </div>
        )}

        {asset.content && (
          <div className="mt-5">
            <p className="text-xs font-medium text-slate-400">내용</p>
            <pre className="mt-1 whitespace-pre-wrap break-words rounded-lg border border-slate-700 bg-slate-950/60 p-4 font-mono text-xs text-slate-200">
              {asset.content}
            </pre>
          </div>
        )}
      </div>

      {/* 안내 */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 backdrop-blur">
        <p className="flex items-center gap-2 text-sm font-medium text-amber-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          이 페이지는 1회만 열람 가능합니다
        </p>
        <p className="mt-1 text-xs text-amber-200/80">
          {notice} 만료 시각: {formatDateTime(expiresAt)}.
        </p>
      </div>
    </div>
  );
}

function ErrorView({
  title,
  message,
  hint,
}: {
  title: string;
  message: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center shadow-2xl backdrop-blur">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-400">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="text-xl font-semibold text-slate-50">{title}</h1>
      <p className="mt-3 text-sm text-slate-300">{message}</p>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
