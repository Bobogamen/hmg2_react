import { toast, Bounce } from "react-toastify";
import i18n from "../locales/i18n";
import ApiError from "../api/utils/ApiError";

// Pass a logout callback from your app to handle session expiration
export const setupInterceptors = (api, onLogout) => {

  api.interceptors.response.use(
    (response) => response,

    (error) => {
      let apiError;

      if (!error.response) {
        // Network / server not responding
        apiError = new ApiError({
          message: "server:notResponding",
          status: 0,
        });
      } else {
        const { status, data } = error.response;

        // Determine message from backend
        const message = data?.message
          || (Array.isArray(data?.errors) ? data.errors[0] : null)
          || (typeof data === "string" ? data : "server:error");

        apiError = new ApiError({
          status,
          message,
          errors: data?.errors || null,
        });
      }

      // Toast messages
      let toastMessage = "";

      if (apiError.isValidationError) {
        // Form will handle field errors, optional generic toast
        toastMessage = i18n.t("server:badRequest");
      } else if (apiError.isAuthError) {
        // 401 - Unauthorized
        toastMessage = i18n.t(`auth:${apiError.message}`) || i18n.t("auth:pleaseLoginAgain");

        // Force logout if callback provided
        if (onLogout) onLogout();
      } else if (apiError.isForbidden) {
        toastMessage = i18n.t("auth:accessDenied");
      } else if (apiError.isServerError) {
        toastMessage = i18n.t("server:serverError");
      } else if (apiError.isNetworkError) {
        toastMessage = i18n.t("server:notResponding");
      } else {
        toastMessage = i18n.t(`auth:${apiError.message}`) || i18n.t("server:error");
      }

      // Show toast for all errors except validation (which is handled in forms)
      if (!apiError.isValidationError || apiError.isServerError) {
        toast.error(toastMessage, {
          transition: Bounce,
          toastId: `${apiError.status}-${apiError.message}`,
        });
      }

      return Promise.reject(apiError);
    }
  );
};