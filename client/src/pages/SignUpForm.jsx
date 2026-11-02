import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState, useEffect } from "react";
import api from "../lib/api";
import { readApiError } from "../lib/errors";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useUser } from "../contexts/UserContext";
import Seo from "../components/Seo";

function toE164(phone) {
  let value = String(phone || "").trim().replace(/[^\d+]/g, "");
  if (value.startsWith("00")) value = `+${value.slice(2)}`;
  if (/^01\d{9}$/.test(value)) value = `+2${value}`;
  if (/^1\d{9}$/.test(value)) value = `+20${value}`;
  if (value && !value.startsWith("+")) value = `+${value}`;
  return value;
}

const signUpSchema = yup.object().shape({
  fullName: yup.string().max(16).required("nameRequired"),
  phoneNumber: yup.string().required("phoneRequired"),
  gender: yup.string().required("genderRequired"),
  dateOfBirth: yup
    .date()
    .required("dobRequired")
    .max(new Date(), "dobPast"),
  email: yup.string().email("invalidEmail").required("emailRequired"),
  password: yup
    .string()
    .min(8, "passwordMin")
    .matches(/\d/, "passwordNumber")
    .matches(/[A-Z]/, "passwordUpper")
    .matches(/[@$!%*?&]/, "passwordSpecial")
    .required("passwordRequired"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "passwordsMatch")
    .required("confirmRequired"),
});

const SignUpForm = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    fullName: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();

  const {
    register,
    handleSubmit,
    trigger,
    setError,
    formState: { errors },
    watch
  } = useForm({
    resolver: yupResolver(signUpSchema),
    mode: "onChange"
  });

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken && 
        window.location.pathname !== '/signup' && 
        !location.state?.fromSignup) {
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    }
  }, [navigate, location]);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage("");
    setFieldErrors({
      fullName: "",
      phoneNumber: "",
      gender: "",
      dateOfBirth: "",
      email: "",
      password: "",
      confirmPassword: ""
    });

    try {
      const payload = {
        name: data.fullName,
        email: data.email.trim(),
        password: data.password,
        phone: toE164(data.phoneNumber),
        gender: data.gender,
        birthDate: data.dateOfBirth instanceof Date
          ? data.dateOfBirth.toISOString().split("T")[0]
          : String(data.dateOfBirth).slice(0, 10),
      };

      const response = await api.post("/auth/regist", payload);

      if (response.status === 201) {
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userName", data.fullName);
        setSuccess(true);
        if (response.data.token) {
          await login(response.data.token, {
            ...response.data,
            name: data.fullName,
            email: data.email,
          });
          navigate("/dashboard", { replace: true, state: { fromSignup: true } });
          return;
        }
        navigate("/verify-email", {
          state: {
            email: data.email,
            fullName: data.fullName,
            fromSignup: true,
            devLink: response.data.devLink,
          },
          replace: true,
        });
      }
    } catch (error) {
      const apiError = readApiError(error, "serverError");
      if (apiError.fields.length) {
        apiError.fields.forEach((fieldError) => {
          const field = fieldError.field === "phone"
            ? "phoneNumber"
            : fieldError.field === "name"
              ? "fullName"
              : fieldError.field;
          setFieldErrors((prev) => ({
            ...prev,
            [field]: fieldError.key,
          }));
          setError(field, {
            type: "manual",
            message: fieldError.key,
          });
        });
      } else if (error.response?.status === 409) {
        setFieldErrors((prev) => ({
          ...prev,
          email: apiError.key,
        }));
        setError("email", {
          type: "manual",
          message: apiError.key,
        });
      } else {
        setErrorMessage(t(apiError.key));
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return '';
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };
    const strength = Object.values(checks).filter(Boolean).length;
    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Medium';
    return 'Strong';
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColor = {
    Weak: 'bg-red-500',
    Medium: 'bg-yellow-500',
    Strong: 'bg-green-500',
  }[passwordStrength];

  const nextStep = async () => {
    const valid = await trigger(["fullName", "phoneNumber", "gender", "dateOfBirth"]);
    if (valid) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  // Watch password field for real-time strength
  const watchedPassword = watch("password", "");

  useEffect(() => {
    setPassword(watchedPassword);
  }, [watchedPassword]);

  return (
    <div className="auth-card">
      <Seo titleKey="seoSignupTitle" descKey="seoHomeDesc" path="/signup" />
      <h1>{t("createAccount")}</h1>
      <p className="lead">{t("joinCommunity")}</p>
      <div className="step-dots" aria-hidden="true">
        <span className={step >= 1 ? "on" : undefined}>1</span>
        <i />
        <span className={step >= 2 ? "on" : undefined}>2</span>
      </div>
      <p className="dash-muted">{step === 1 ? t("personalInfo") : t("accountDetails")}</p>

      {step === 1 ? (
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="fullName" className="field-label">{t("fullName")}</label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              {...register("fullName")}
              className={`field ${errors.fullName || fieldErrors.fullName ? "is-bad" : ""}`}
            />
            {(errors.fullName || fieldErrors.fullName) && (
              <p className="field-error" role="alert">{t(errors.fullName?.message || fieldErrors.fullName)}</p>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="field-label">{t("phoneNumber")}</label>
            <input
              id="phoneNumber"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              {...register("phoneNumber")}
              className={`field ${errors.phoneNumber || fieldErrors.phoneNumber ? "is-bad" : ""}`}
              placeholder="+20 10 0000 0000"
            />
            {(errors.phoneNumber || fieldErrors.phoneNumber) && (
              <p className="field-error" role="alert">{t(errors.phoneNumber?.message || fieldErrors.phoneNumber)}</p>
            )}
          </div>

          <div>
            <label htmlFor="gender" className="field-label">{t("gender")}</label>
            <select
              id="gender"
              {...register("gender")}
              className={`field-select ${errors.gender || fieldErrors.gender ? "is-bad" : ""}`}
            >
              <option value="">{t("select", { label: t("gender") })}</option>
              <option value="male">{t("male")}</option>
              <option value="female">{t("female")}</option>
            </select>
            {(errors.gender || fieldErrors.gender) && (
              <p className="field-error" role="alert">{t(errors.gender?.message || fieldErrors.gender)}</p>
            )}
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="field-label">{t("dateOfBirth")}</label>
            <input
              id="dateOfBirth"
              type="date"
              {...register("dateOfBirth")}
              className={`field ${errors.dateOfBirth || fieldErrors.dateOfBirth ? "is-bad" : ""}`}
            />
            {(errors.dateOfBirth || fieldErrors.dateOfBirth) && (
              <p className="field-error" role="alert">{t(errors.dateOfBirth?.message || fieldErrors.dateOfBirth)}</p>
            )}
          </div>

          <button type="button" onClick={nextStep} className="ink-btn wide">
            {t("next")}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="field-label">{t("email")}</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className={`field ${errors.email || fieldErrors.email ? "is-bad" : ""}`}
              placeholder="example@gmail.com"
            />
            {(errors.email || fieldErrors.email) && (
              <p className="field-error" role="alert">{t(errors.email?.message || fieldErrors.email)}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="field-label">{t("password")}</label>
            <div className="field-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("password")}
                className={`field ${errors.password || fieldErrors.password ? "is-bad" : ""}`}
                style={{ paddingInlineEnd: "4.5rem", paddingInlineStart: "0.7rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-btn field-reveal"
              >
                {showPassword ? t("hidePassword") : t("showPassword")}
              </button>
            </div>
            {password && (
              <div className="meter" aria-hidden="true" style={{ marginTop: "0.45rem" }}>
                <span style={{ width: `${({ Weak: 33, Medium: 66, Strong: 100 }[passwordStrength] || 0)}%` }} className={strengthColor} />
              </div>
            )}
            {(errors.password || fieldErrors.password) && (
              <p className="field-error" role="alert">{t(errors.password?.message || fieldErrors.password)}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="field-label">{t("confirmPassword")}</label>
            <div className="field-wrap">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={`field ${errors.confirmPassword || fieldErrors.confirmPassword ? "is-bad" : ""}`}
                style={{ paddingInlineEnd: "4.5rem", paddingInlineStart: "0.7rem" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-btn field-reveal"
              >
                {showConfirmPassword ? t("hidePassword") : t("showPassword")}
              </button>
            </div>
            {(errors.confirmPassword || fieldErrors.confirmPassword) && (
              <p className="field-error" role="alert">{t(errors.confirmPassword?.message || fieldErrors.confirmPassword)}</p>
            )}
          </div>

          {success && <p className="notice ok">{t("accountCreated")}</p>}
          {errorMessage && <p className="notice bad">{errorMessage}</p>}

          <div className="form-actions">
            <button type="button" onClick={prevStep} className="ghost-btn">{t("back")}</button>
            <button type="submit" disabled={loading} className="ink-btn">
              {loading ? t("saving") : t("signUp")}
            </button>
          </div>
        </form>
      )}

      {/* Login Link */}
      <p className="dash-muted" style={{ marginTop: "1rem" }}>
        {t("haveAccount")} <Link to="/login" className="text-link">{t("signIn")}</Link>
      </p>
    </div>
  );
};

export default SignUpForm;
