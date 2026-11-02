export function normalizeAccountEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizePhone(value) {
  let phone = String(value || "").trim().replace(/[^\d+]/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  if (/^01\d{9}$/.test(phone)) phone = `+2${phone}`;
  if (/^1\d{9}$/.test(phone)) phone = `+20${phone}`;
  if (phone && !phone.startsWith("+")) phone = `+${phone}`;
  return phone;
}
