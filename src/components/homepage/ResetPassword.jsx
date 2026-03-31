import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLoading } from "../../loader/LoadingContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { changePassword } from "../../api/services/forgotPasswordService";
import i18n from "../../locales/i18n";
import { Bounce, toast } from "react-toastify";
import renderFieldErrors from "../../utils/renderFieldErrors";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const { t } = useTranslation([
    "auth",
    "common",
    "validation",
    "profile",
    "server",
  ]);

  const { setIsLoading } = useLoading();
  const navigate = useNavigate();

  // -------------------------
  // 🌍 language sync
  // -------------------------
  useEffect(() => {
    const langFromUrl = searchParams.get("selectedLanguage");

    if (langFromUrl && langFromUrl !== i18n.language) {
      i18n.changeLanguage(langFromUrl);
      localStorage.setItem("selectedLanguage", langFromUrl);
    }
  }, [searchParams]);

  // -------------------------
  // 🔥 normalize validation errors
  // -------------------------
  const normalizeErrors = (err) => {
    const data = err?.validationErrors || err?.errors;

    if (!data) return {};

    if (Array.isArray(data)) {
      // global errors → handled via toast, not fields
      return { _global: data };
    }

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setErrors({});

    try {
      const response = await changePassword({
        password,
        confirmPassword,
        token,
      });

      // -------------------------
      // ✅ SUCCESS
      // -------------------------
      if (response?.messages?.length) {
        response.messages.forEach((m) =>
          toast.success(t(`auth:${m}`), { transition: Bounce })
        );
      }

      setPassword("");
      setConfirmPassword("");
      navigate("/");

    } catch (error) {
      // -------------------------
      // ⚠️ VALIDATION ERROR
      // -------------------------
      if (error.isValidationError) {
        const normalized = normalizeErrors(error);

        // 🔴 global errors → toast
        if (normalized._global) {
          normalized._global.forEach((err) =>
            toast.error(t(`validation:${err}`), {
              transition: Bounce,
              toastId: err,
            })
          );
        }

        // 🔴 field errors → inline
        const { _global, ...fieldErrors } = normalized;
        setErrors(fieldErrors);

        return;
      }

      // -------------------------
      // 💥 fallback safety (optional)
      // -------------------------
      toast.error(t("server:serverError"), {
        transition: Bounce,
        toastId: "server-error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="mt-2">{t("profile:changePassword")}</h2>

      <div className="d-flex justify-content-center">
        <div>
          <form className="registrationForm" onSubmit={handleSubmit}>
            {/* PASSWORD */}
            <div className="mt-2">
              <label>{t("profile:password")}</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {renderFieldErrors(errors, "password", t)}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="mt-2">
              <label>{t("auth:confirmPassword")}</label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {renderFieldErrors(errors, "confirmPassword", t)}
            </div>

            <button type="submit" className="authentication-button mt-4">
              {t("common:send")}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;