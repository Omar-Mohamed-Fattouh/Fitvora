import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../lib/api";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "react-feather";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import Seo from "../components/Seo";

const loginSchema = yup.object({
  email: yup.string().email("invalidEmail").required("emailRequired"),
  password: yup.string().required("passwordRequired"),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login } = useUser();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess(false);

    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const userData = response.data;

      if (userData && userData.token) {
        localStorage.setItem("authToken", userData.token);
        localStorage.setItem("userEmail", userData.accountInfo.email);
        localStorage.setItem("userName", userData.accountInfo.name || "");
        localStorage.setItem("userData", JSON.stringify(userData));

        await login(userData.token, {
          ...userData,
          name: userData.accountInfo?.name,
          email: userData.accountInfo?.email,
        });

        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1000);
      } else {
        setError("email", { type: "manual", message: "invalidUserData" });
        setError("password", { type: "manual", message: "invalidUserData" });
      }
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        navigate("/verify-email", { state: { email: data.email } });
        return;
      }
      // Handle field-specific errors from API
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach((apiError) => {
          setError(apiError.field, {
            type: "manual",
            message: apiError.message,
          });
        });
      }
      // Handle general error message (e.g., "Incorrect email or password")
      else if (err.response?.data?.msg) {
        setError("email", {
          type: "manual",
          message: err.response.data.msg,
        });
        setError("password", {
          type: "manual",
          message: err.response.data.msg,
        });
      } else {
        // Fallback: show a generic error under both fields
        setError("email", { type: "manual", message: "loginFailed" });
        setError("password", { type: "manual", message: "loginFailed" });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dash-loading">{t("authenticating")}</div>;
  }

  return (
    <div className="auth-card">
      <Seo titleKey="seoLoginTitle" descKey="seoHomeDesc" path="/login" />
      <h1>{t("login")}</h1>
      <p className="lead">{t("brandTag")}</p>
      {success && <p className="notice ok">{t("loginSuccess")}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="field-label">{t("email")}</label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={`field ${errors.email ? "is-bad" : ""}`}
            placeholder="your@email.com"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby="email-error"
          />
          {errors.email && (
            <p
              id="email-error"
              className="mt-1 text-sm text-red-600 flex items-center"
              role="alert"
            >
              <AlertCircle className="mr-2" size={16} />
              {t(errors.email.message)}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="field-label">{t("password")}</label>
          <div className="field-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`field ${errors.password ? "is-bad" : ""}`}
              placeholder="••••••••"
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby="password-error"
              style={{ paddingInlineEnd: "2.4rem" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="fav-btn"
              style={{ position: "absolute", insetInlineEnd: "0.6rem", top: "0.7rem" }}
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p
              id="password-error"
              className="mt-1 text-sm text-red-600 flex items-center"
              role="alert"
            >
              <AlertCircle className="mr-2" size={16} />
              {t(errors.password.message)}
            </p>
          )}
        </div>

        {/* Remember Me and Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700"
            >
              {t("rememberMe")}
            </label>
          </div>
          <Link
            to="/forgot-password"
            className="text-link"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="ink-btn wide">
          {loading ? t("signingIn") : t("signIn")}
        </button>
      </form>

      {/* Signup Link */}
      <p className="dash-muted" style={{ marginTop: "1.1rem" }}>
        {t("noAccount")} <Link to="/signup" className="text-link">{t("signUp")}</Link>
      </p>
    </div>
  );
};

export default Login;
