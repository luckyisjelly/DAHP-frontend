import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore, selectIsAuthenticated } from "@/store/auth";

export function AuthLayout() {
  const isAuthed = useAuthStore(selectIsAuthenticated);
  if (isAuthed) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold">DAHP</h1>
        <Outlet />
      </div>
    </div>
  );
}
