import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../lib/api";
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import Seo from "../components/Seo";

const healthInfoSchema = yup.object().shape({
  height: yup.string().required("height"),
  weight: yup.string().required("weight"),
  fitnessGoals: yup.string().required("fitnessGoals"),
  activityLevel: yup.string().required("activityLevel"),
  healthConditions: yup.string().required("healthConditions"),
  bodyFatPercentage: yup.string().required("bodyFat"),
  preferredWorkoutType: yup.string().required("preferredWorkout"),
  restingHeartRate: yup.string().required("restingHr"),
});

// Define SelectField component before using it
const SelectField = ({ name, label, options, register, errors, t }) => (
  <div>
    <label htmlFor={name} className="field-label">{label}</label>
    <select id={name} {...register(name)} className={`field-select ${errors[name] ? "is-bad" : ""}`}>
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    {errors[name] && <p className="notice bad">{t(errors[name].message)}</p>}
  </div>
);

const InfoHealthFitness = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { t } = useLanguage();

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(healthInfoSchema),
    mode: "onChange"
  });

  useEffect(() => {
    const initializeForm = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          navigate('/login');
          return;
        }

        // Check if user data is available from context
        if (user?.email) {
          setUserEmail(user.email);
          setUserName(user.name || "");
          
          // Fetch health info if exists
          try {
            const response = await api.get("/users/current/healthInfo");
            const info = response.data.healthInfo || response.data;
            if (info) {
              Object.entries(info).forEach(([key, value]) => {
                if (value) setValue(key, value);
              });
            }
          } catch (error) {
            console.log("No existing health info found");
          }
          return;
        }

        // Fallback to localStorage if no context user
        const storedEmail = localStorage.getItem('userEmail');
        const storedName = localStorage.getItem('userName');
        
        if (storedEmail) {
          setUserEmail(storedEmail);
          setUserName(storedName || "");
          
          // Try to fetch health info from API
          try {
            const response = await api.get("/users/current/healthInfo");
            const info = response.data.healthInfo || response.data;
            if (info) {
              Object.entries(info).forEach(([key, value]) => {
                if (value) setValue(key, value);
              });
            }
          } catch (error) {
            console.log("No existing health info found");
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error("Initialization error:", error);
        navigate('/login');
      }
    };

    initializeForm();
  }, [location, navigate, setValue, user]);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage("");
    setSuccess(false);

    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error("Authentication required");
      }

      // Update health info via API
      const response = await api.put("/users/current/healthInfo", data);

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { healthInfoUpdated: true },
          replace: true
        });
      }, 2000);

    } catch (error) {
      console.error("Submission error:", error);
      setErrorMessage(
        error.response?.data?.msg ||
        error.response?.data?.message ||
        error.message ||
        t("healthSaveFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  // Options for dropdowns
  const dropdownOptions = {
    height: [
      { value: "100-130", label: t("height_100") },
      { value: "130-160", label: t("height_130") },
      { value: "160-180", label: t("height_160") },
      { value: "180-200", label: t("height_180") },
      { value: "200-220", label: t("height_200") },
    ],
    weight: [
      { value: "40-55", label: t("weight_40") },
      { value: "55-70", label: t("weight_55") },
      { value: "70-85", label: t("weight_70") },
      { value: "85-100", label: t("weight_85") },
      { value: "100-120", label: t("weight_100") },
      { value: "120-140", label: t("weight_120") },
      { value: "140-160", label: t("weight_140") },
    ],
    fitnessGoals: [
      { value: "weight-loss", label: t("weight-loss") },
      { value: "muscle-gain", label: t("muscle-gain") },
      { value: "endurance", label: t("endurance") },
      { value: "maintenance", label: t("maintenance") },
      { value: "rehabilitation", label: t("rehabilitation") },
      { value: "mobility", label: t("mobility") },
      { value: "recomposition", label: t("recomposition") },
    ],
    activityLevel: [
      { value: "sedentary", label: t("sedentary") },
      { value: "light", label: t("light") },
      { value: "moderate", label: t("moderate") },
      { value: "active", label: t("active") },
      { value: "extreme", label: t("extreme") },
    ],
    healthConditions: [
      { value: "none", label: t("none") },
      { value: "hypertension", label: t("hypertension") },
      { value: "diabetes", label: t("diabetes") },
      { value: "heart-disease", label: t("heart-disease") },
      { value: "asthma", label: t("asthma") },
      { value: "joint-pain", label: t("joint-pain") },
      { value: "thyroid", label: t("thyroid") },
    ],
    bodyFatPercentage: [
      { value: "5-10", label: t("bodyfat_low") },
      { value: "10-15", label: t("bodyfat_athletic") },
      { value: "15-20", label: t("bodyfat_fitness") },
      { value: "20-25", label: t("bodyfat_average") },
      { value: "25-30", label: t("bodyfat_25") },
      { value: "30+", label: t("bodyfat_30") },
    ],
    preferredWorkoutType: [
      { value: "cardio", label: t("cardio") },
      { value: "strength", label: t("strength") },
      { value: "hiit", label: t("hiit") },
      { value: "yoga", label: t("yoga") },
      { value: "crossfit", label: t("crossfit") },
      { value: "sports", label: t("sports") },
      { value: "pilates", label: t("pilates") },
      { value: "swimming", label: t("swimming") },
      { value: "cycling", label: t("cycling") },
    ],
    restingHeartRate: [
      { value: "40-60", label: t("rhr_athlete") },
      { value: "60-80", label: t("rhr_healthy") },
      { value: "80-100", label: t("rhr_average") },
      { value: "100+", label: t("rhr_high") },
    ]
  };

  return (
    <div className="dash-page" style={{ maxWidth: "46rem" }}>
      <Seo titleKey="seoHealthTitle" descKey="healthSub" path="/health-info" />
      <header className="dash-head">
        <div>
          <h1>{t("healthTitle")}</h1>
          <p>{t("healthSub")}</p>
          {userEmail && <p className="dash-muted">{t("forUser", { name: userName })}</p>}
        </div>
      </header>
      <div className="dash-card pad">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField name="height" label={t("height")} options={dropdownOptions.height} register={register} errors={errors} t={t} />
            <SelectField name="weight" label={t("weight")} options={dropdownOptions.weight} register={register} errors={errors} t={t} />
            <SelectField name="fitnessGoals" label={t("fitnessGoals")} options={dropdownOptions.fitnessGoals} register={register} errors={errors} t={t} />
            <SelectField name="activityLevel" label={t("activityLevel")} options={dropdownOptions.activityLevel} register={register} errors={errors} t={t} />
            <SelectField name="healthConditions" label={t("healthConditions")} options={dropdownOptions.healthConditions} register={register} errors={errors} t={t} />
            <SelectField name="bodyFatPercentage" label={t("bodyFat")} options={dropdownOptions.bodyFatPercentage} register={register} errors={errors} t={t} />
            <SelectField name="preferredWorkoutType" label={t("preferredWorkout")} options={dropdownOptions.preferredWorkoutType} register={register} errors={errors} t={t} />
            <SelectField name="restingHeartRate" label={t("restingHr")} options={dropdownOptions.restingHeartRate} register={register} errors={errors} t={t} />
          </div>

          {success && <p className="notice ok">{t("healthSaved")}</p>}
          {errorMessage && <p className="notice bad">{errorMessage}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="ink-btn">
              {loading ? t("saving") : t("saveInfo")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InfoHealthFitness;