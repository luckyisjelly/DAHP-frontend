import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore, selectIsAuthenticated } from "@/store/auth";

export function AuthLayout() {
  const isAuthed = useAuthStore(selectIsAuthenticated);
  if (isAuthed) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-40">
        <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 flex flex-col items-center gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500 text-xl font-bold text-white">
            D
          </span>
          <h1 className="text-xl font-semibold text-slate-50">DAHP</h1>
          <p className="text-xs text-slate-400">Digital Asset Handover Platform</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
