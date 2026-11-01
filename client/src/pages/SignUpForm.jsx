import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import api from "../lib/api";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Calendar,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ArrowRight,
  ArrowLeft
} from "react-feather";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import Seo from "../components/Seo";

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

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors, isValid },
    setValue,
    setError,
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
        email: data.email,
        password: data.password,
        phoneCode: "+1",
        phone: data.phoneNumber,
        gender: data.gender,
        birthDate: data.dateOfBirth.toISOString().split("T")[0],
      };

      const response = await api.post("/auth/regist", payload);

      if (response.status === 201) {
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userName", data.fullName);
        setSuccess(true);
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
      console.error("Error submitting form:", error);
      
      if (error.response) {
        // Handle field-specific errors from API
        if (error.response.data.errors) {
          error.response.data.errors.forEach(err => {
            setFieldErrors(prev => ({
              ...prev,
              [err.field]: err.message
            }));
            setError(err.field, {
              type: "manual",
              message: err.message
            });
          });
        } 
        // Handle generic error messages
        else if (error.response.data.msg) {
          if (error.response.status === 409) {
            setFieldErrors(prev => ({
              ...prev,
              email: error.response.data.msg
            }));
            setError("email", {
              type: "manual",
              message: error.response.data.msg
            });
          } else {
            setErrorMessage(error.response.data.msg);
          }
        } else {
          setErrorMessage("An error occurred. Please try again.");
        }
      } else {
        setErrorMessage("Network error. Please check your connection.");
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
        <form className="space-y-4" onSubmit={e => e.preventDefault()}>
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 flex items-center">
              <User className="mr-1" size={14} />
              {t("fullName")}
            </label>
            <div className="relative">
              <input
                type="text"
                {...register("fullName")}
                className={`block w-full pl-8 pr-3 py-2 text-sm border ${
                  errors.fullName || fieldErrors.fullName ? "border-red-500" : "border-gray-300"
                } field`}
                placeholder="Enter your full name"
              />
              <User className="absolute left-2 top-3 text-gray-400" size={16} />
            </div>
            {(errors.fullName || fieldErrors.fullName) && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="mr-1" size={12} />
                {t(errors.fullName?.message || fieldErrors.fullName)}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 flex items-center">
              <Phone className="mr-1" size={14} />
              {t("phoneNumber")}
            </label>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <PhoneInput
                    {...field}
                    international
                    defaultCountry="US"
                    className={`block w-full pl-8 pr-3 py-2 text-sm border ${
                      errors.phoneNumber || fieldErrors.phoneNumber ? "border-red-500" : "border-gray-300"
                    } field`}
                    placeholder="Enter phone number"
                    onChange={(value) => field.onChange(value)}
                    value={field.value || ''}
                  />
                  <Phone className="absolute left-2 top-3 text-gray-400" size={16} />
                </div>
              )}
            />
            {(errors.phoneNumber || fieldErrors.phoneNumber) && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="mr-1" size={12} />
                {t(errors.phoneNumber?.message || fieldErrors.phoneNumber)}
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 flex items-center">
              <User className="mr-1" size={14} />
              {t("gender")}
            </label>
            <div className="relative">
              <select
                {...register("gender")}
                className={`block w-full pl-8 pr-3 py-2 text-sm appearance-none border ${
                  errors.gender || fieldErrors.gender ? "border-red-500" : "border-gray-300"
                } field`}
              >
                <option value="">{t("select", { label: t("gender") })}</option>
                <option value="male">{t("male")}</option>
                <option value="female">{t("female")}</option>
              </select>
              <User className="absolute left-2 top-3 text-gray-400" size={16} />
              <ChevronDown className="absolute right-2 top-3 text-gray-400" size={16} />
            </div>
            {(errors.gender || fieldErrors.gender) && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="mr-1" size={12} />
                {t(errors.gender?.message || fieldErrors.gender)}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 flex items-center">
              <Calendar className="mr-1" size={14} />
              {t("dateOfBirth")}
            </label>
            <Controller
              name="dateOfBirth"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <div className="relative">
                    <DatePicker
                      {...field}
                      value={field.value || null}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          error: !!errors.dateOfBirth || !!fieldErrors.dateOfBirth,
                          helperText: t(errors.dateOfBirth?.message || fieldErrors.dateOfBirth || ""),
                          InputProps: {
                            startAdornment: (
                              <Calendar className="mr-1 text-gray-400" size={16} />
                            ),
                            className: "pl-8 text-sm"
                          },
                        },
                      }}
                    />
                    <Calendar className="absolute left-2 top-2 text-gray-400" size={16} />
                  </div>
                </LocalizationProvider>
              )}
            />
          </div>

          {/* Next Button */}
          <button type="button" onClick={nextStep} className="ink-btn wide">
            {t("next")}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 flex items-center">
              <Mail className="mr-1" size={14} />
              {t("email")}
            </label>
            <div className="relative">
              <input
                type="email"
                {...register("email")}
                className={`block w-full pl-8 pr-3 py-2 text-sm border ${
                  errors.email || fieldErrors.email ? "border-red-500" : "border-gray-300"
                } field`}
                placeholder="example@gmail.com"
              />
              <Mail className="absolute left-2 top-3 text-gray-400" size={16} />
            </div>
            {(errors.email || fieldErrors.email) && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="mr-1" size={12} />
                {t(errors.email?.message || fieldErrors.email)}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 flex items-center">
              <Lock className="mr-1" size={14} />
              {t("password")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`block w-full pl-8 pr-8 py-2 text-sm border ${
                  errors.password || fieldErrors.password ? "border-red-500" : "border-gray-300"
                } field`}
                placeholder="••••••••"
              />
              <Lock className="absolute left-2 top-3 text-gray-400" size={16} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            {password && (
              <div className="mt-1 space-y-1">
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${strengthColor}`} 
                    style={{ 
                      width: `${(Object.values({
                        length: password.length >= 8,
                        uppercase: /[A-Z]/.test(password),
                        lowercase: /[a-z]/.test(password),
                        number: /\d/.test(password),
                        special: /[@$!%*?&]/.test(password),
                      }).filter(Boolean).length / 5) * 100}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between text-xxs text-gray-500">
                  <span className={`font-medium ${
                    passwordStrength === 'Weak' ? 'text-red-500' :
                    passwordStrength === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {passwordStrength}
                  </span>
                </div>
              </div>
            )}
            
            {(errors.password || fieldErrors.password) && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="mr-1" size={12} />
                {t(errors.password?.message || fieldErrors.password)}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 flex items-center">
              <Lock className="mr-1" size={14} />
              {t("confirmPassword")}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={`block w-full pl-8 pr-8 py-2 text-sm border ${
                  errors.confirmPassword || fieldErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                } field`}
                placeholder="••••••••"
              />
              <Lock className="absolute left-2 top-3 text-gray-400" size={16} />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {(errors.confirmPassword || fieldErrors.confirmPassword) && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="mr-1" size={12} />
                {t(errors.confirmPassword?.message || fieldErrors.confirmPassword)}
              </p>
            )}
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-start space-x-2 text-green-700 text-sm">
              <CheckCircle className="mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="font-medium">Account created successfully!</p>
                <p className="text-xs">Check your email to verify your account.</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2 text-red-700 text-sm">
              <AlertCircle className="mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="font-medium">Registration failed</p>
                <p className="text-xs">{errorMessage}</p>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button type="button" onClick={prevStep} className="ghost-btn" style={{ flex: 1 }}>{t("back")}</button>
            <button type="submit" disabled={loading} className="ink-btn" style={{ flex: 1 }}>
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
