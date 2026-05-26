import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-slate-300">
      <p className="text-5xl font-semibold text-slate-50">404</p>
      <p>요청하신 페이지를 찾을 수 없습니다.</p>
      <Link
        to="/"
        className="text-sm text-violet-400 underline-offset-4 hover:text-violet-300 hover:underline"
      >
        홈으로
      </Link>
    </div>
  );
}
