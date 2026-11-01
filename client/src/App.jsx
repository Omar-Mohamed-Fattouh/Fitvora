import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { UserProvider } from "./contexts/UserContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";

const Welcome = lazy(() => import("./pages/Welcome"));
const About = lazy(() => import("./pages/About"));
const Guides = lazy(() => import("./pages/Guides"));
const Contact = lazy(() => import("./pages/Contact"));
const SignUpForm = lazy(() => import("./pages/SignUpForm"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Activity = lazy(() => import("./pages/Activity"));
const InfoHealthFitness = lazy(() => import("./pages/InfoHealthFitness"));
const Settings = lazy(() => import("./pages/Settings"));
const Workouts = lazy(() => import("./pages/Workouts"));
const Nutrition = lazy(() => import("./pages/Nutrition"));
const Legal = lazy(() => import("./pages/Legal"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => {
  const { t } = useLanguage();
  return (
    <div className="dash-loading" role="status">{t("loading")}</div>
  );
};

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const { t } = useLanguage();
  return (
    <div role="alert" className="prose-page">
      <p>{t("somethingWrong")}</p>
      <pre>{error.message}</pre>
      <button type="button" className="ink-btn" onClick={resetErrorBoundary}>{t("tryAgain")}</button>
    </div>
  );
};

const App = () => (
  <LanguageProvider>
    <UserProvider>
      <Router>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<PageLoader />}>
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
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/health-info" element={<InfoHealthFitness />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/workouts" element={<Workouts />} />
                  <Route path="/nutrition" element={<Nutrition />} />
                </Route>
              </Route>

              <Route path="/infoHealthFitness" element={<Navigate to="/health-info" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </UserProvider>
  </LanguageProvider>
);

export default App;
