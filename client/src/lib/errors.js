const CODE_TO_KEY = {
  INVALID_CREDENTIALS: "invalidCredentials",
  EMAIL_EXISTS: "emailExists",
  UNVERIFIED: "needsVerification",
  NETWORK: "networkError",
  SERVER_ERROR: "serverError",
  VALIDATION: "fixFields",
};

const LEGACY_MSG_TO_KEY = {
  "Incorrect email or password": "invalidCredentials",
  "this email already exists": "emailExists",
  "Please verify your email before signing in.": "needsVerification",
  "An error occurred. Please try again.": "serverError",
  "Network error. Please check your connection.": "networkError",
};

export function readApiError(error, fallbackKey = "serverError") {
  if (!error?.response) {
    return {
      code: "NETWORK",
      key: "networkError",
      fields: [],
      needsVerification: false,
    };
  }

  const data = error.response.data || {};
  if (data.needsVerification) {
    return {
      code: "UNVERIFIED",
      key: "needsVerification",
      fields: [],
      needsVerification: true,
      email: data.email,
    };
  }

  const fields = Array.isArray(data.errors)
    ? data.errors.map((item) => ({
        field: item.field,
        key: item.message,
      }))
    : [];

  const key =
    CODE_TO_KEY[data.code] ||
    LEGACY_MSG_TO_KEY[data.msg] ||
    data.msg ||
    (error.response.status >= 500 ? "serverError" : fallbackKey);

  return {
    code: data.code || (fields.length ? "VALIDATION" : "UNKNOWN"),
    key,
    fields,
    needsVerification: false,
  };
}
