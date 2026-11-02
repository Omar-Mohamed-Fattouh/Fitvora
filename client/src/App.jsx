import React, { lazy } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { UserProvider } from "./contexts/UserContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LazyPage from "./components/LazyPage";
import Welcome from "./pages/Welcome";
import About from "./pages/About";
import Guides from "./pages/Guides";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import SignUpForm from "./pages/SignUpForm";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Activity = lazy(() => import("./pages/Activity"));
const InfoHealthFitness = lazy(() => import("./pages/InfoHealthFitness"));
const Settings = lazy(() => import("./pages/Settings"));
const Workouts = lazy(() => import("./pages/Workouts"));
const Nutrition = lazy(() => import("./pages/Nutrition"));

const ErrorFallback = ({ resetErrorBoundary }) => {
  const { t } = useLanguage();
  return (
    <div role="alert" className="prose-page">
      <p>{t("somethingWrong")}</p>
      <button type="button" className="ink-btn" onClick={resetErrorBoundary}>{t("tryAgain")}</button>
    </div>
  );
};

const App = () => (
  <LanguageProvider>
    <UserProvider>
      <Router>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Welcome />} />
              <Route path="/about" element={<About />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/guides/:slug" element={<Guides />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Legal />} />
              <Route path="/terms" element={<Legal />} />
            </Route>

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUpForm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<LazyPage variant="dashboard"><Dashboard /></LazyPage>} />
                <Route path="/activity" element={<LazyPage variant="table"><Activity /></LazyPage>} />
                <Route path="/health-info" element={<LazyPage variant="page"><InfoHealthFitness /></LazyPage>} />
                <Route path="/settings" element={<LazyPage variant="page"><Settings /></LazyPage>} />
                <Route path="/workouts" element={<LazyPage variant="cards"><Workouts /></LazyPage>} />
                <Route path="/nutrition" element={<LazyPage variant="cards"><Nutrition /></LazyPage>} />
              </Route>
            </Route>

            <Route path="/infoHealthFitness" element={<Navigate to="/health-info" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </UserProvider>
  </LanguageProvider>
);

export default App;
