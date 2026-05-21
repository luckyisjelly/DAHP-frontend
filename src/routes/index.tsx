import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AssetsPage } from "@/pages/AssetsPage";
import { RecipientsPage } from "@/pages/RecipientsPage";
import { RulesPage } from "@/pages/RulesPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
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
