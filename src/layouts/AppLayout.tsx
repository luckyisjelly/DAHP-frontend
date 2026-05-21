import { Link, NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { useAuthStore, selectIsAuthenticated } from "@/store/auth";

const navItems = [
  { to: "/dashboard", label: "대시보드" },
  { to: "/assets", label: "자산" },
  { to: "/recipients", label: "수령인" },
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
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="text-lg font-semibold">
            DAHP
          </Link>
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    "text-sm",
                    isActive
                      ? "font-semibold text-slate-900"
                      : "text-slate-500 hover:text-slate-900",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">{user?.email ?? ""}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
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
