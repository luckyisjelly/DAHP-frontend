export function AssetsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">자산</h2>
        <button
          type="button"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          새 자산 등록
        </button>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        아직 등록된 자산이 없습니다.
      </div>
    </div>
  );
}
