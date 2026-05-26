export function RulesPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-50">인계 규칙</h2>
        <button
          type="button"
          className="rounded-md bg-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-colors hover:bg-violet-400"
        >
          + 새 규칙 만들기
        </button>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-center text-sm text-slate-400">
        Placeholder
      </div>
    </div>
  );
}
