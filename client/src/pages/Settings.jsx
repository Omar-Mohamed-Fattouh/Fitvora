import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";
import Seo from "../components/Seo";

const passwordSchema = yup.object({
  currPassword: yup.string().required("passwordRequired"),
  newPassword: yup.string().min(8, "atLeast8").matches(/\d/, "needNumber").matches(/[A-Z]/, "needUpper").matches(/[@$!%*?&]/, "needSpecial"),
  confirmNewPassword: yup.string().oneOf([yup.ref("newPassword")], "passwordsMatch"),
});

const profileSchema = yup.object({
  name: yup.string().min(3).max(16).required("nameRequired"),
  phone: yup.string().min(7).max(20).required("phoneRequired"),
});

const Settings = () => {
  const { user, logout, refreshUserData } = useUser();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: yupResolver(passwordSchema) });
  const { register: registerProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm({
    resolver: yupResolver(profileSchema),
    values: { name: user?.name || "", phone: user?.phone || "" },
  });

  const onPassword = async (data) => {
    setError("");
    setMessage("");
    try {
      const { data: result } = await api.patch("/users/current/password", data);
      setMessage(result.msg);
      reset();
    } catch {
      setError(t("couldNotUpdatePassword"));
    }
  };

  const onProfile = async (data) => {
    setError("");
    setMessage("");
    try {
      const { data: result } = await api.patch("/users/current/profile", data);
      setMessage(result.msg);
      await refreshUserData();
    } catch {
      setError(t("couldNotUpdateProfile"));
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm(t("deleteConfirm"))) return;
    await api.delete("/users/current");
    logout();
    navigate("/");
  };

  return (
    <div className="dash-page" style={{ maxWidth: "40rem" }}>
      <Seo titleKey="seoSettingsTitle" descKey="settingsSub" path="/settings" />
      <header className="dash-head">
        <div>
          <h1>{t("settingsTitle")}</h1>
          <p>{t("settingsSub")}</p>
        </div>
      </header>
      {message && <p className="notice ok" role="status">{message}</p>}
      {error && <p className="notice bad" role="alert">{error}</p>}

      <section className="dash-card pad">
        <h3>{t("language")}</h3>
        <p>{t("languageHint")}</p>
        <LanguageToggle />
      </section>

      <section className="dash-card pad">
        <h3>{t("profile")}</h3>
        <dl className="mini-dl">
          <div><dt>{t("email")}</dt><dd>{user?.email || "—"}</dd></div>
          <div><dt>{t("verification")}</dt><dd>{user?.isVerified === false ? t("pending") : t("verified")}</dd></div>
          <div><dt>{t("gender")}</dt><dd>{user?.gender ? t(user.gender) : "—"}</dd></div>
        </dl>
        <form onSubmit={handleProfile(onProfile)} className="contact-form" style={{ marginTop: "1rem" }}>
          <label className="field-label" htmlFor="profile-name">{t("name")}</label>
          <input id="profile-name" className="field" {...registerProfile("name")} />
          {profileErrors.name && <p className="notice bad">{t(profileErrors.name.message)}</p>}
          <label className="field-label" htmlFor="profile-phone">{t("phone")}</label>
          <input id="profile-phone" className="field" {...registerProfile("phone")} />
          {profileErrors.phone && <p className="notice bad">{t(profileErrors.phone.message)}</p>}
          <button type="submit" className="ink-btn">{t("saveProfile")}</button>
        </form>
      </section>

      <section className="dash-card pad">
        <h3>{t("changePassword")}</h3>
        <form onSubmit={handleSubmit(onPassword)} className="contact-form">
          <label className="field-label" htmlFor="curr-pass">{t("currentPassword")}</label>
          <input id="curr-pass" type="password" className="field" {...register("currPassword")} />
          {errors.currPassword && <p className="notice bad">{t(errors.currPassword.message)}</p>}
          <label className="field-label" htmlFor="new-pass">{t("newPassword")}</label>
          <input id="new-pass" type="password" className="field" {...register("newPassword")} />
          {errors.newPassword && <p className="notice bad">{t(errors.newPassword.message)}</p>}
          <label className="field-label" htmlFor="confirm-pass">{t("confirmNewPassword")}</label>
          <input id="confirm-pass" type="password" className="field" {...register("confirmNewPassword")} />
          {errors.confirmNewPassword && <p className="notice bad">{t(errors.confirmNewPassword.message)}</p>}
          <button type="submit" className="ink-btn">{t("updatePassword")}</button>
        </form>
      </section>

      <section className="dash-card pad">
        <h3>{t("dangerZone")}</h3>
        <p>{t("deleteAccountText")}</p>
        <button type="button" className="danger-btn" onClick={deleteAccount}>{t("deleteAccount")}</button>
      </section>
    </div>
  );
};

export default Settings;
