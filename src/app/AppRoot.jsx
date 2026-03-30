import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "../App.css";
import { AppShell, LoadingScreen, ProtectedRoute, PublicOnlyRoute } from "../components/layout";
import { useAuth } from "../contexts/AuthContext";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const PricingPage = lazy(() => import("../pages/PricingPage"));
const AuthPage = lazy(() => import("../pages/AuthPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const AiToolsPage = lazy(() => import("../pages/AiToolsPage"));
const BillingPage = lazy(() => import("../pages/BillingPage"));
const AccountPage = lazy(() => import("../pages/AccountPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen label="Loading page..." />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <AuthPage mode="login" />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <AuthPage mode="signup" />
            </PublicOnlyRoute>
          }
        />
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="ai" element={<AiToolsPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function AppRoot() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen label="Loading your StudySync workspace..." />;
  }

  return <AppRoutes />;
}
