import { toast, Bounce } from "react-toastify";
import i18n from "../locales/i18n";

let isLoggingOut = false;

export const setupInterceptors = (api, logout) => {
  api.interceptors.response.use(
    (response) => response,

    (error) => {
      const status = error.response?.status;
      const url = error.config?.url;

      // -------------------------
      // ❌ NETWORK ERROR
      // -------------------------
      if (!error.response && !error.isValidationError) {
        toast.error(i18n.t("server:notResponding"), {
          transition: Bounce,
          toastId: "network-error",
        });

        return Promise.reject(error);
      }

      // -------------------------
      // ⚠️ VALIDATION ERROR
      // -------------------------
      if (status === 400 || status === 422) {
        error.isValidationError = true;
        error.validationErrors = error.response?.data?.errors;

        return Promise.reject(error);
      }

      // -------------------------
      // 🔑 LOGIN ERROR (MUST BE FIRST)
      // -------------------------
      if (url?.includes("/login")) {
        if (status === 401) {
          toast.error(i18n.t("auth:invalidCredentials"), {
            transition: Bounce,
            toastId: "invalid-credentials",
          });
        }

        return Promise.reject(error);
      }

      // -------------------------
      // 🔐 SESSION EXPIRED (ALL OTHER 401s)
      // -------------------------
      if (status === 401) {
        toast.error(i18n.t("auth:sessionExpired"), {
          transition: Bounce,
          toastId: "session-expired",
        });

        if (!isLoggingOut && logout) {
          isLoggingOut = true;
          logout();
        }

        return Promise.reject(error);
      }

      // -------------------------
      // ⛔ FORBIDDEN
      // -------------------------
      if (status === 403) {
        toast.error(i18n.t("auth:accessDenied"), {
          transition: Bounce,
          toastId: "forbidden",
        });
      }

      // -------------------------
      // 💥 SERVER ERROR
      // -------------------------
      if (status >= 500) {
        toast.error(i18n.t("server:serverError"), {
          transition: Bounce,
          toastId: "server-error",
        });
      }

      return Promise.reject(error);
    }
  );
};