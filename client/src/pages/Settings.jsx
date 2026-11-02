import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";
import Seo from "../components/Seo";
import PhoneField, { isValidPhoneNumber } from "../components/PhoneField";
import PasswordReveal from "../components/PasswordReveal";

const passwordSchema = yup.object({
  currPassword: yup.string().required("passwordRequired"),
  newPassword: yup.string().min(8, "atLeast8").matches(/\d/, "needNumber").matches(/[A-Z]/, "needUpper").matches(/[@$!%*?&]/, "needSpecial"),
  confirmNewPassword: yup.string().oneOf([yup.ref("newPassword")], "passwordsMatch"),
});

const profileSchema = yup.object({
  name: yup.string().min(3).max(16).required("nameRequired"),
  phone: yup.string().required("phoneRequired").test("phone", "phoneInvalid", (value) => Boolean(value && isValidPhoneNumber(value))),
});

const Settings = () => {
  const { user, logout, refreshUserData } = useUser();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: yupResolver(passwordSchema) });
  const { register: registerProfile, control: profileControl, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm({
    resolver: yupResolver(profileSchema),
    values: { name: user?.name || "", phone: user?.phone || "" },
  });

  const onPassword = async (data) => {
    setError("");
    setMessage("");
    try {
      await api.patch("/users/current/password", data);
      setMessage(t("passwordUpdated"));
      reset();
    } catch {
      setError(t("couldNotUpdatePassword"));
    }
  };

  const onProfile = async (data) => {
    setError("");
    setMessage("");
    try {
      await api.patch("/users/current/profile", data);
      setMessage(t("profileUpdated"));
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
          <input id="profile-name" className="field" placeholder={t("placeholderName")} {...registerProfile("name")} />
          {profileErrors.name && <p className="notice bad">{t(profileErrors.name.message)}</p>}
          <label className="field-label" htmlFor="profile-phone">{t("phone")}</label>
          <Controller
            name="phone"
            control={profileControl}
            render={({ field }) => (
              <PhoneField
                id="profile-phone"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={Boolean(profileErrors.phone)}
                placeholder={t("placeholderPhone")}
              />
            )}
          />
          {profileErrors.phone && <p className="notice bad">{t(profileErrors.phone.message)}</p>}
          <button type="submit" className="ink-btn">{t("saveProfile")}</button>
        </form>
      </section>

      <section className="dash-card pad">
        <h3>{t("changePassword")}</h3>
        <form onSubmit={handleSubmit(onPassword)} className="contact-form">
          <label className="field-label" htmlFor="curr-pass">{t("currentPassword")}</label>
          <div className="field-wrap">
            <input id="curr-pass" type={showCurrent ? "text" : "password"} className="field" placeholder={t("placeholderCurrentPassword")} {...register("currPassword")} />
            <PasswordReveal show={showCurrent} onToggle={() => setShowCurrent((value) => !value)} showLabel={t("showPassword")} hideLabel={t("hidePassword")} />
          </div>
          {errors.currPassword && <p className="notice bad">{t(errors.currPassword.message)}</p>}
          <label className="field-label" htmlFor="new-pass">{t("newPassword")}</label>
          <div className="field-wrap">
            <input id="new-pass" type={showNew ? "text" : "password"} className="field" placeholder={t("placeholderNewPassword")} {...register("newPassword")} />
            <PasswordReveal show={showNew} onToggle={() => setShowNew((value) => !value)} showLabel={t("showPassword")} hideLabel={t("hidePassword")} />
          </div>
          {errors.newPassword && <p className="notice bad">{t(errors.newPassword.message)}</p>}
          <label className="field-label" htmlFor="confirm-pass">{t("confirmNewPassword")}</label>
          <input id="confirm-pass" type="password" className="field" placeholder={t("placeholderConfirmPassword")} {...register("confirmNewPassword")} />
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
