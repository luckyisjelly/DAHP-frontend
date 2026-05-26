import { Link, NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { useAuthStore, selectIsAuthenticated } from "@/store/auth";

const navItems = [
  { to: "/dashboard", label: "대시보드" },
  { to: "/assets", label: "자산" },
  { to: "/recipients", label: "수신자" },
  { to: "/rules", label: "인계 규칙" },
];

export function AppLayout() {
  const isAuthed = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();

  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold text-slate-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500 text-sm font-bold text-white">
              D
            </span>
            DAHP
          </Link>
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    "text-sm transition-colors",
                    isActive
                      ? "font-semibold text-violet-400"
                      : "text-slate-400 hover:text-slate-100",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400">{user?.email ?? ""}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-slate-100"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
