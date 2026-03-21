import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bounce, toast } from "react-toastify";
import { useLoading } from "../../loader/LoadingContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { changePassword } from "../../api/services/forgotPasswordService";
import renderFieldErrors from "../../utils/renderFieldErrors";
import i18n from "../../locales/i18n";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const { t } = useTranslation(["auth", "common", "validation", "profile", "server"]);
  const { setIsLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    const langFromUrl = searchParams.get("selectedLanguage");

    if (langFromUrl && langFromUrl !== i18n.language) {
      i18n.changeLanguage(langFromUrl);
      localStorage.setItem("selectedLanguage", langFromUrl);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") setPassword(value);
    else if (name === "confirmPassword") setConfirmPassword(value);
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

      if (response.messages?.length) {
        response.messages.forEach((m) =>
          toast.success(t(`auth:${m}`), { transition: Bounce })
        );

        setPassword("");
        setConfirmPassword("");
        navigate("/");
      }

    } catch (error) {
      if (error.isValidationError && error.errors) {

        // 🔴 FIELD errors (object)
        if (!Array.isArray(error.errors)) {
          setErrors(error.errors);
        }

        // 🔴 GLOBAL errors (array) → show toast
        else {
          error.errors.forEach((err) =>
            toast.error(t(`validation:${err}`), { transition: Bounce })
          );
        }

      }
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

            <div className="mt-2">
              <label>{t("profile:password")}</label>
              <input
                type="password"
                placeholder={t("profile:password")}
                name="password"
                value={password}
                onChange={handleChange}
              />
              {renderFieldErrors(errors, "password", t)}
            </div>

            <div className="mt-2">
              <label>{t("auth:confirmPassword")}</label>
              <input
                type="password"
                placeholder={t("auth:confirmPassword")}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
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