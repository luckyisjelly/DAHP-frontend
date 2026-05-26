import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckInWidget } from "@/components/dashboard/CheckInWidget";
import { listAssets } from "@/api/assets";
import { listRecipients } from "@/api/recipients";

export function DashboardPage() {
  const [assetCount, setAssetCount] = useState<number | null>(null);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAssets({ size: 1 })
      .then((p) => {
        if (!cancelled) setAssetCount(p.totalElements);
      })
      .catch(() => {
        if (!cancelled) setAssetCount(0);
      });
    listRecipients({ size: 1 })
      .then((p) => {
        if (!cancelled) setRecipientCount(p.totalElements);
      })
      .catch(() => {
        if (!cancelled) setRecipientCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h2 className="text-2xl font-semibold text-slate-50">대시보드</h2>
        <p className="mt-1 text-sm text-slate-400">
          계정, 파일, 메시지를 정리하고 조건 기반으로 전달하세요.
        </p>
      </header>

      <CheckInWidget />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="등록된 자산"
          value={assetCount === null ? "-" : `${assetCount}`}
          unit="개"
          to="/assets"
        />
        <StatCard
          label="수신자"
          value={recipientCount === null ? "-" : `${recipientCount}`}
          unit="명"
          to="/recipients"
        />
        <StatCard
          label="활성 인계 규칙"
          value="-"
          unit=""
          to="/rules"
          hint="준비 중"
        />
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-300">빠른 시작</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <QuickAction
            title="자산 등록하기"
            description="계정, 파일, 메시지 추가"
            accent="violet"
            to="/assets"
          />
          <QuickAction
            title="수신자 지정하기"
            description="신뢰할 수 있는 사람 설정"
            accent="green"
            to="/recipients"
          />
          <QuickAction
            title="전달 조건 설정"
            description="자동 전달 조건 구성 (준비 중)"
            accent="blue"
            to="/rules"
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  to,
  hint,
}: {
  label: string;
  value: string;
  unit: string;
  to: string;
  hint?: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-colors hover:border-slate-700"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{label}</p>
        {hint && (
          <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-500">
            {hint}
          </span>
        )}
      </div>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-slate-50">{value}</span>
        {unit && <span className="text-sm text-slate-400">{unit}</span>}
      </p>
    </Link>
  );
}

const accentMap = {
  violet: "border-violet-500/40 bg-violet-500/5 hover:border-violet-500/70",
  blue: "border-blue-500/40 bg-blue-500/5 hover:border-blue-500/70",
  green: "border-green-500/40 bg-green-500/5 hover:border-green-500/70",
} as const;

function QuickAction({
  title,
  description,
  accent,
  to,
}: {
  title: string;
  description: string;
  accent: keyof typeof accentMap;
  to: string;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-start gap-1 rounded-xl border bg-slate-900/40 p-4 transition-colors ${accentMap[accent]}`}
    >
      <span className="text-sm font-semibold text-slate-100">{title}</span>
      <span className="text-xs text-slate-400">{description}</span>
    </Link>
  );
}
