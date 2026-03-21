import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { sendEmail } from "../../api/services/forgotPasswordService";
import { useLoading } from "../../loader/LoadingContext";
import config from "../../api/configuration";

const ForgotPassword = () => {
      const [email, setEmail] = useState("");

      // 🔴 validation errors (array for now, scalable later)
      const [errors, setErrors] = useState([]);

      // 🟢 success messages
      const [messages, setMessages] = useState([]);

      const { t, i18n } = useTranslation(["validation", "common"]);
      const { isLoading, setIsLoading } = useLoading();

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

                  // ✅ success
                  setMessages(response.messages || []);

            } catch (error) {
                  if (error.isValidationError) {
                        // 🔥 ALWAYS normalize to array (future-proof)
                        if (Array.isArray(error.errors)) {
                              setErrors(error.errors);
                        } else if (typeof error.errors === "string") {
                              setErrors([error.errors]);
                        } else {
                              setErrors([]);
                        }
                  }
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
                                                                  className="bg-danger text-light rounded px-2 py-1 d-block mt-1"
                                                            >
                                                                  {t(`validation:${error}`)}
                                                            </small>
                                                      ))}
                                                </div>
                                          )}

                                          {/* 🟢 SUCCESS MESSAGES */}
                                          {messages.length > 0 && (
                                                <div className="mt-2">
                                                      {messages.map((msg, index) => (
                                                            <span
                                                                  key={index}
                                                                  className="bg-success text-light rounded px-2 py-1 d-block mt-1"
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
                                          disabled={isLoading || messages.length > 0}
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