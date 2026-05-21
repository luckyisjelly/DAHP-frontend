import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-slate-700">
      <p className="text-5xl font-semibold">404</p>
      <p>요청하신 페이지를 찾을 수 없습니다.</p>
      <Link to="/" className="text-sm underline">
        홈으로
      </Link>
    </div>
  );
}
