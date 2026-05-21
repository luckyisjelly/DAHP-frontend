import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "@/api/auth";
import { ApiError } from "@/api/client";

export function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checkInIntervalDays, setCheckInIntervalDays] = useState(7);
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
          minLength={8}
          maxLength={100}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
        />
        <span className="text-xs text-slate-500">8~100자</span>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-700">체크인 주기 (일)</span>
        <input
          type="number"
          required
          min={1}
          max={365}
          value={checkInIntervalDays}
          onChange={(e) => setCheckInIntervalDays(Number(e.target.value))}
          className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
        />
        <span className="text-xs text-slate-500">1~365일. 이 주기마다 생존 확인이 필요합니다.</span>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "가입 중..." : "회원가입"}
      </button>
      <p className="text-center text-sm text-slate-600">
        이미 계정이 있으신가요?{" "}
        <Link to="/login" className="font-medium text-slate-900 underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
