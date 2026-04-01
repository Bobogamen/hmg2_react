import { toast, Bounce } from "react-toastify";
import i18n from "../locales/i18n";

export const setupInterceptors = (api, logout) => {
  let isLoggingOut = false; // 🔥 prevent multiple triggers

  api.interceptors.response.use(
    (response) => response,

    (error) => {
      const status = error?.response?.status;
      const data = error?.response?.data;
      const message = data?.message;

      // -----------------------------
      // 🔴 VALIDATION (400)
      // -----------------------------
      if (status === 400) {
        return Promise.reject({
          ...error,
          isValidationError: true,
          validationErrors: data?.errors || {},
        });
      }

      // -----------------------------
      // 🔐 SESSION EXPIRED (401)
      // -----------------------------
      if (status === 401 && message === "sessionExpired") {

        // 🔁 prevent duplicate logout + toast
        if (!isLoggingOut) {
          isLoggingOut = true;

          toast.error(i18n.t("auth:sessionExpired"), {
            transition: Bounce,
            toastId: "session-expired",
          });

          logout(); // ✅ clean logout (NO redirect here)
        }

        return Promise.reject({
          ...error,
          isAuthError: true,
        });
      }

      // -----------------------------
      // 🔑 INVALID CREDENTIALS (LOGIN)
      // -----------------------------
      if (status === 401 && message === "invalidCredentials") {
        return Promise.reject({
          ...error,
          isAuthError: true,
          message: "invalidCredentials",
        });
      }

      // -----------------------------
      // ⛔ FORBIDDEN (403)
      // -----------------------------
      if (status === 403) {
        toast.error(i18n.t("auth:accessDenied"), {
          transition: Bounce,
        });

        return Promise.reject({
          ...error,
          isForbidden: true,
        });
      }

      // -----------------------------
      // 🌐 SERVER / NETWORK
      // -----------------------------
      if (!error.response) {
        toast.error(i18n.t("server:notResponding"), {
          transition: Bounce,
        });

        return Promise.reject({
          ...error,
          isNetworkError: true,
        });
      }

      if (status >= 500) {
        toast.error(i18n.t("server:error"), {
          transition: Bounce,
        });

        return Promise.reject({
          ...error,
          isServerError: true,
        });
      }

      // -----------------------------
      // ⚠️ FALLBACK
      // -----------------------------
      return Promise.reject(error);
    }
  );
};