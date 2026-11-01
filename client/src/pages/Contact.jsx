import { useState } from "react";
import Seo from "../components/Seo";
import api from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setSending(true);
    const form = new FormData(event.currentTarget);
    try {
      await api.post("/contact", {
        name: form.get("name"),
        email: form.get("email"),
        message: form.get("message"),
      });
      setStatus(t("contactSent"));
      event.currentTarget.reset();
    } catch {
      setError(t("contactError"));
    } finally {
      setSending(false);
    }
  };

  return (
    <article className="prose-page">
      <Seo titleKey="seoContactTitle" descKey="seoContactDesc" path="/contact" />
      <h1 className="display">{t("contactTitle")}</h1>
      <p className="lead">{t("contactLead")}</p>
      <form className="contact-form" onSubmit={onSubmit}>
        <label htmlFor="contact-name">{t("contactName")}</label>
        <input id="contact-name" name="name" required minLength={2} autoComplete="name" />
        <label htmlFor="contact-email">{t("contactEmail")}</label>
        <input id="contact-email" name="email" type="email" required autoComplete="email" />
        <label htmlFor="contact-message">{t("contactMessage")}</label>
        <textarea id="contact-message" name="message" required minLength={8} rows={6} />
        {status && <p role="status">{status}</p>}
        {error && <p role="alert">{error}</p>}
        <button type="submit" className="ink-btn" disabled={sending}>
          {sending ? t("sendingLink") : t("contactSend")}
        </button>
      </form>
    </article>
  );
};

export default Contact;
