import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import PasswordReveal from "../components/PasswordReveal";

const schema = yup.object({
  password: yup.string().min(8, "passwordMin").matches(/\d/, "passwordNumber").matches(/[A-Z]/, "passwordUpper").matches(/[@$!%*?&]/, "passwordSpecial").required("passwordRequired"),
  confirmPassword: yup.string().oneOf([yup.ref("password"), null], "passwordsMatch").required("confirmRequired"),
});

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, password: data.password });
      setSuccess(true);
    } catch {
      setError(t("resetFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>{t("newPasswordTitle")}</h1>
      {!token && <p className="notice bad">{t("resetTokenMissing")}</p>}
      {error && <p className="notice bad">{error}</p>}
      {success ? (
        <div className="notice ok">
          <p>{t("passwordUpdated")}</p>
          <Link to="/login" className="text-link">{t("goLogin")}</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="field-label" htmlFor="password">{t("newPassword")}</label>
          <div className="field-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("placeholderNewPassword")}
              {...register("password")}
              className={`field ${errors.password ? "is-bad" : ""}`}
            />
            <PasswordReveal
              show={showPassword}
              onToggle={() => setShowPassword((value) => !value)}
              showLabel={t("showPassword")}
              hideLabel={t("hidePassword")}
            />
          </div>
          {errors.password && <p className="notice bad">{t(errors.password.message)}</p>}
          <label className="field-label" htmlFor="confirmPassword">{t("confirmPassword")}</label>
          <input id="confirmPassword" type="password" placeholder={t("placeholderConfirmPassword")} {...register("confirmPassword")} className={`field ${errors.confirmPassword ? "is-bad" : ""}`} />
          {errors.confirmPassword && <p className="notice bad">{t(errors.confirmPassword.message)}</p>}
          <button type="submit" disabled={loading || !token} className="ink-btn wide">
            {loading ? t("updating") : t("updatePasswordBtn")}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
