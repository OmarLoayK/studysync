import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "../App.css";
import { AppShell, LoadingScreen, ProtectedRoute, PublicOnlyRoute } from "../components/layout";
import { useAuth } from "../contexts/AuthContext";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const PricingPage = lazy(() => import("../pages/PricingPage"));
const TermsPage = lazy(() => import("../pages/TermsPage"));
const PrivacyPage = lazy(() => import("../pages/PrivacyPage"));
const SupportPage = lazy(() => import("../pages/SupportPage"));
const AuthPage = lazy(() => import("../pages/AuthPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const AiToolsPage = lazy(() => import("../pages/AiToolsPage"));
const BillingPage = lazy(() => import("../pages/BillingPage"));
const AccountPage = lazy(() => import("../pages/AccountPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));

function HashScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const id = location.hash.replace("#", "");

    window.requestAnimationFrame(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }, [location.hash, location.pathname]);

  return null;
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen label="Loading page..." />}>
      <HashScrollManager />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/support" element={<SupportPage />} />
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
