import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5174";

export function buildAuthLinks(kind, token) {
  if (kind === "verify") {
    return `${CLIENT_URL}/verify-email?token=${token}`;
  }
  return `${CLIENT_URL}/reset-password?token=${token}`;
}

function emailCopy(locale, kind, url) {
  const ar = locale === "ar";
  if (kind === "verify") {
    return {
      subject: ar ? "أكد حساب Fitvora" : "Verify your Fitvora account",
      text: ar ? `أهلًا بك في Fitvora. أكد إيميلك من هنا: ${url}` : `Welcome to Fitvora. Verify your email: ${url}`,
      html: `<div style="font-family:system-ui,Segoe UI,Tahoma,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
        <h1 style="color:#4f46e5;font-size:22px;margin:0 0 12px">Fitvora</h1>
        <p>${ar ? "أهلًا بك. اضغط الزر عشان نأكد إيميلك ونفتح لوحة التحكم." : "Welcome. Tap the button to verify your email and open your dashboard."}</p>
        <p><a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px">${ar ? "تأكيد الإيميل" : "Verify email"}</a></p>
        <p style="color:#64748b;font-size:12px">${url}</p>
      </div>`,
    };
  }
  return {
    subject: ar ? "إعادة تعيين كلمة مرور Fitvora" : "Reset your Fitvora password",
    text: ar ? `إعادة تعيين كلمة المرور: ${url}` : `Reset your password: ${url}`,
    html: `<div style="font-family:system-ui,Segoe UI,Tahoma,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
      <h1 style="color:#4f46e5;font-size:22px;margin:0 0 12px">Fitvora</h1>
      <p>${ar ? "اضغط الزر لتعيين كلمة مرور جديدة. اللينك ينتهي خلال 30 دقيقة." : "Tap the button to set a new password. This link expires in 30 minutes."}</p>
      <p><a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px">${ar ? "تعيين كلمة مرور" : "Reset password"}</a></p>
      <p style="color:#64748b;font-size:12px">${url}</p>
    </div>`,
  };
}

let cachedTransport;

async function createTransport() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  const cachePath = path.join(process.cwd(), ".ethereal.json");
  let account;
  if (fs.existsSync(cachePath)) {
    account = JSON.parse(fs.readFileSync(cachePath, "utf8"));
  } else {
    account = await nodemailer.createTestAccount();
    fs.writeFileSync(cachePath, JSON.stringify(account, null, 2));
    console.log("Created Ethereal inbox for Fitvora mail:", account.user);
  }

  return nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass },
  });
}

async function getTransport() {
  if (!cachedTransport) cachedTransport = await createTransport();
  return cachedTransport;
}

export function buildAuthEmail(kind, url, locale = "en") {
  return emailCopy(locale, kind, url);
}

export async function sendAuthEmail({ to, subject, text, html }) {
  try {
    const transporter = await getTransport();
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || "Fitvora <no-reply@fitvora.app>",
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log("\n--- Fitvora email ---");
    console.log("To:", to);
    console.log("Subject:", subject);
    if (previewUrl) console.log("Preview:", previewUrl);
    else console.log("Message ID:", info.messageId);
    console.log("---------------------\n");
    return { delivered: true, previewUrl, messageId: info.messageId };
  } catch (err) {
    console.error("Email send failed:", err.message);
    console.log(text);
    return { delivered: false, error: err.message };
  }
}
