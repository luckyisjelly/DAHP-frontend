export function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h2 className="text-2xl font-semibold text-slate-50">대시보드</h2>
        <p className="mt-1 text-sm text-slate-400">
          계정, 파일, 메시지를 정리하고 조건 기반으로 전달하세요.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="등록된 자산" value="-" />
        <StatCard label="활성 규칙" value="-" />
        <StatCard label="최근 체크인" value="-" />
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-300">빠른 시작</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <QuickAction
            title="자산 등록하기"
            description="계정, 파일, 메시지 추가"
            accent="violet"
          />
          <QuickAction
            title="수신자 지정하기"
            description="신뢰할 수 있는 사람 설정"
            accent="blue"
          />
          <QuickAction
            title="전달 조건 설정"
            description="자동 전달 조건 구성"
            accent="green"
          />
        </div>
      </section>

      <p className="text-xs text-slate-500">
        와이어프레임 반영 전 placeholder 화면입니다.
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-50">{value}</p>
    </div>
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
}: {
  title: string;
  description: string;
  accent: keyof typeof accentMap;
}) {
  return (
    <button
      type="button"
      className={`flex flex-col items-start gap-1 rounded-xl border bg-slate-900/40 p-4 text-left transition-colors ${accentMap[accent]}`}
    >
      <span className="text-sm font-semibold text-slate-100">{title}</span>
      <span className="text-xs text-slate-400">{description}</span>
    </button>
  );
}
