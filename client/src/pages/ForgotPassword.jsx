import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";

const schema = yup.object({
  email: yup.string().email("invalidEmail").required("emailRequired"),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [devLink, setDevLink] = useState("");
  const [preview, setPreview] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setGeneralError("");
    try {
      const { data: result } = await api.post("/auth/forgot-password", { email: data.email.trim() });
      setSuccess(true);
      setDevLink(result.devLink || "");
      setPreview(result.emailPreview || "");
    } catch (error) {
      const status = error.response?.status;
      setGeneralError(t(status >= 500 ? "serverError" : "sendResetFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <button type="button" className="text-btn" onClick={() => navigate(-1)}>{t("back")}</button>
      <h1>{t("resetPassword")}</h1>
      <p className="lead">{t("resetHint")}</p>
      {generalError && <p className="notice bad">{generalError}</p>}
      {success ? (
        <div className="notice ok">
          <p>{t("checkEmail")}</p>
          <p>{t("resetOnTheWay")}</p>
          {devLink && <a href={devLink} className="text-link">{t("openReset")}</a>}
          {preview && <a href={preview} target="_blank" rel="noreferrer" className="text-link">{preview}</a>}
          <Link to="/login" className="text-link">{t("goLogin")}</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="field-label" htmlFor="email">{t("emailAddress")}</label>
          <input id="email" type="email" placeholder={t("placeholderEmail")} {...register("email")} className={`field ${errors.email ? "is-bad" : ""}`} />
          {errors.email && <p className="notice bad">{t(errors.email.message)}</p>}
          <button type="submit" disabled={loading} className="ink-btn wide">{loading ? t("sendingLink") : t("sendReset")}</button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
