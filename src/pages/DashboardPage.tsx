export function DashboardPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">대시보드</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="자산" value="-" />
        <Card title="활성 규칙" value="-" />
        <Card title="최근 체크인" value="-" />
      </div>
      <p className="mt-8 text-sm text-slate-500">
        와이어프레임 반영 전 placeholder 화면입니다.
      </p>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
