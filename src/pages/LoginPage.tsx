import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "@/api/auth";
import { useAuthStore } from "@/store/auth";
import { ApiError } from "@/api/client";

interface LocationState {
  signupEmail?: string;
}

export function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const fromSignup = (location.state as LocationState | null) ?? null;

  const [email, setEmail] = useState(fromSignup?.signupEmail ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login({ email, password });
      setAuth(res.accessToken, res.refreshToken, res.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {fromSignup?.signupEmail && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          회원가입이 완료되었습니다. 로그인해주세요.
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-700">이메일</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-700">비밀번호</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "로그인 중..." : "로그인"}
      </button>
      <p className="text-center text-sm text-slate-600">
        계정이 없으신가요?{" "}
        <Link to="/signup" className="font-medium text-slate-900 underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
