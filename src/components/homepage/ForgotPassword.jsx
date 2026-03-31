import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { sendEmail } from "../../api/services/forgotPasswordService";
import { useLoading } from "../../loader/LoadingContext";
import config from "../../api/configuration";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState([]);
  const [messages, setMessages] = useState([]);

  const { t, i18n } = useTranslation(["validation", "common"]);
  const { setIsLoading } = useLoading();

  // -------------------------
  // 🔥 normalize validation errors (reusable pattern)
  // -------------------------
  const normalizeErrors = (err) => {
    const data = err?.validationErrors || err?.errors;

    if (Array.isArray(data)) return data;
    if (typeof data === "string") return [data];
    if (data && typeof data === "object") return Object.values(data).flat();

    return [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setErrors([]);
    setMessages([]);

    try {
      const response = await sendEmail(
        email,
        i18n.language,
        config.app.baseURL
      );

      setMessages(response?.messages || []);
    } catch (error) {
      // -------------------------
      // ⚠️ validation errors only
      // -------------------------
      if (error.isValidationError) {
        setErrors(normalizeErrors(error));
        return;
      }

      // (optional) fallback for safety if needed
      setErrors([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="mt-2">{t("auth:forgotPassword")}</h2>

      <div className="d-flex justify-content-center">
        <div>
          <form className="registrationForm" onSubmit={handleSubmit}>
            <div>
              {/* INPUT */}
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* 🔴 ERRORS */}
              {errors.length > 0 && (
                <div className="mt-2">
                  {errors.map((error, index) => (
                    <small
                      key={index}
                      className="d-inline-block bg-danger text-light rounded mt-1 px-1 width-fit-content"
                    >
                      {t(`validation:${error}`)}
                    </small>
                  ))}
                </div>
              )}

              {/* 🟢 SUCCESS */}
              {messages.length > 0 && (
                <div className="mt-2">
                  {messages.map((msg, index) => (
                    <span
                      key={index}
                      className="d-inline-block bg-success text-light rounded mt-1 px-1 width-fit-content"
                    >
                      {t(`validation:${msg}`)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="authentication-button mt-3"
              disabled={messages.length > 0}
            >
              {t("common:send")}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;