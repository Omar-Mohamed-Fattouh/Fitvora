import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useUser();
  const { t } = useLanguage();
  const token = searchParams.get("token");
  const email = location.state?.email || localStorage.getItem("userEmail") || "";
  const [status, setStatus] = useState(token ? "verifying" : "pending");
  const [message, setMessage] = useState("");
  const [devLink, setDevLink] = useState(location.state?.devLink || "");

  useEffect(() => {
    const verify = async () => {
      if (!token) return;
      try {
        const { data } = await api.post("/auth/verify-email", { token });
        if (data.token) {
          await login(data.token, {
            name: data.accountInfo?.name,
            email: data.accountInfo?.email,
          });
        }
        setStatus("success");
        setMessage(data.msg);
        setTimeout(() => navigate("/dashboard", { replace: true, state: { fromSignup: true } }), 1200);
      } catch {
        setStatus("error");
        setMessage(t("verifyInvalid"));
      }
    };
    verify();
  }, [token]);

  const resend = async () => {
    if (!email) return;
    try {
      const { data } = await api.post("/auth/resend-verification", { email });
      setMessage(data.msg);
      if (data.devLink) setDevLink(data.devLink);
    } catch {
      setMessage(t("resendFailed"));
    }
  };

  return (
    <div className="auth-card">
      <h1>{t("verifyEmail")}</h1>
      <p className="lead">{t("verifySent", { email: email || "inbox" })}</p>
      {status === "verifying" && <p>{t("verifying")}</p>}
      {status === "success" && <p className="notice ok">{message}</p>}
      {status === "error" && <p className="notice bad">{message}</p>}
      {status === "pending" && (
        <div>
          <p>{t("verifyPending")}</p>
          {devLink && <a href={devLink} className="text-link">{t("openVerify")}</a>}
          <button type="button" onClick={resend} className="ink-btn wide" style={{ marginTop: "1rem" }}>{t("resendEmail")}</button>
        </div>
      )}
      <Link to="/login" className="text-link">{t("backToSignIn")}</Link>
    </div>
  );
};

export default VerifyEmail;
