import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../lib/api";
import { readApiError } from "../lib/errors";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import Seo from "../components/Seo";
import PasswordReveal from "../components/PasswordReveal";

const DEMO_EMAIL = "omarmfattouh45@gmail.com";
const DEMO_PASSWORD = "Omar01284$$";

const loginSchema = yup.object({
  email: yup.string().email("invalidEmail").required("emailRequired"),
  password: yup.string().required("passwordRequired"),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const { login } = useUser();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setFormError("");
    clearErrors();

    try {
      const response = await api.post("/auth/login", {
        email: data.email.trim(),
        password: data.password,
      });

      const userData = response.data;

      if (!userData?.token) {
        setFormError(t("invalidUserData"));
        return;
      }

      await login(userData.token, {
        ...userData,
        name: userData.accountInfo?.name,
        email: userData.accountInfo?.email,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const apiError = readApiError(err, "invalidCredentials");
      if (apiError.needsVerification) {
        navigate("/verify-email", { state: { email: data.email } });
        return;
      }
      if (apiError.fields.length) {
        apiError.fields.forEach((fieldError) => {
          setError(fieldError.field, {
            type: "manual",
            message: fieldError.key,
          });
        });
        return;
      }
      setFormError(t(apiError.key));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <Seo titleKey="seoLoginTitle" descKey="seoHomeDesc" path="/login" />
      <h1>{t("login")}</h1>
      <p className="lead">{t("brandTag")}</p>
      {formError && <p className="notice bad" role="alert">{formError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate aria-busy={loading}>
        <div>
          <label htmlFor="email" className="field-label">{t("email")}</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            {...register("email")}
            className={`field ${errors.email ? "is-bad" : ""}`}
            placeholder={t("placeholderEmail")}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby="email-error"
          />
          {errors.email && (
            <p id="email-error" className="field-error" role="alert">
              {t(errors.email.message)}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="field-label">{t("password")}</label>
          <div className="field-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password")}
              className={`field ${errors.password ? "is-bad" : ""}`}
              placeholder={t("placeholderPassword")}
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby="password-error"
            />
            <PasswordReveal
              show={showPassword}
              onToggle={() => setShowPassword((value) => !value)}
              showLabel={t("showPassword")}
              hideLabel={t("hidePassword")}
            />
          </div>
          {errors.password && (
            <p id="password-error" className="field-error" role="alert">
              {t(errors.password.message)}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="auth-remember">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
            />
            <label htmlFor="remember-me" className="field-label" style={{ margin: 0 }}>
              {t("rememberMe")}
            </label>
          </div>
          <Link to="/forgot-password" className="text-link">
            {t("forgotPassword")}
          </Link>
        </div>

        <button type="submit" disabled={loading} className="ink-btn wide">
          {loading ? t("signingIn") : t("signIn")}
        </button>
      </form>

      <p className="dash-muted" style={{ marginTop: "1.1rem" }}>
        {t("noAccount")} <Link to="/signup" className="text-link">{t("signUp")}</Link>
      </p>
    </div>
  );
};

export default Login;
