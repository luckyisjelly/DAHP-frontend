import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AssetsPage } from "@/pages/AssetsPage";
import { RecipientsPage } from "@/pages/RecipientsPage";
import { RulesPage } from "@/pages/RulesPage";
import { HandoverAccessPage } from "@/pages/HandoverAccessPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  // 공개 라우트 (인증 X, 레이아웃 X) — 수령인 접근 페이지
  { path: "/handover-access/:token", element: <HandoverAccessPage /> },

  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/assets", element: <AssetsPage /> },
      { path: "/recipients", element: <RecipientsPage /> },
      { path: "/rules", element: <RulesPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
