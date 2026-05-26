import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "@/api/auth";
import { ApiError } from "@/api/client";

export function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checkInIntervalDays, setCheckInIntervalDays] = useState(90);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup({ email, password, checkInIntervalDays });
      navigate("/login", {
        replace: true,
        state: { signupEmail: email },
      });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
          minLength={8}
          maxLength={100}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8자 이상"
          className="rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-violet-500 focus:bg-slate-800"
        />
        <span className="text-xs text-slate-500">8~100자</span>
      </label>
      <div className="flex flex-col gap-2 text-sm">
        <span className="text-slate-300">체크인 주기</span>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={365}
            value={checkInIntervalDays}
            onChange={(e) => setCheckInIntervalDays(Number(e.target.value))}
            className="flex-1 accent-violet-500"
          />
          <span className="w-16 rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 text-center text-sm text-slate-100">
            {checkInIntervalDays}일
          </span>
        </div>
        <div className="flex gap-2">
          {[30, 90, 180].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setCheckInIntervalDays(d)}
              className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                checkInIntervalDays === d
                  ? "border-violet-500 bg-violet-500/10 text-violet-300"
                  : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              {d === 90 ? "90일 (권장)" : `${d}일`}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500">
          이 주기마다 생존 확인이 필요합니다. 권장: 30~90일.
        </span>
      </div>
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
        {loading ? "가입 중..." : "회원가입"}
      </button>
      <p className="text-center text-sm text-slate-400">
        이미 계정이 있으신가요?{" "}
        <Link
          to="/login"
          className="font-medium text-violet-400 hover:text-violet-300"
        >
          로그인
        </Link>
      </p>
    </form>
  );
}
