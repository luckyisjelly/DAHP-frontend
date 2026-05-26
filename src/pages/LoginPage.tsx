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
        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          회원가입이 완료되었습니다. 로그인해주세요.
        </p>
      )}
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-slate-300">이메일</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-violet-500 focus:bg-slate-800"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-slate-300">비밀번호</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-violet-500 focus:bg-slate-800"
        />
      </label>
      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-md bg-violet-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-colors hover:bg-violet-400 disabled:opacity-50"
      >
        {loading ? "로그인 중..." : "로그인"}
      </button>
      <p className="text-center text-sm text-slate-400">
        계정이 없으신가요?{" "}
        <Link
          to="/signup"
          className="font-medium text-violet-400 hover:text-violet-300"
        >
          회원가입
        </Link>
      </p>
    </form>
  );
}
