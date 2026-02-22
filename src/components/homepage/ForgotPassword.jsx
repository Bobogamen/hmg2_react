import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { sendEmail } from "../../api/services/forgotPasswordService";
import { Bounce, toast } from "react-toastify";
import { useLoading } from "../../loader/LoadingContext";
import config from "../../api/configuration";

const ForgotPassword = () => {
      const [email, setEmail] = useState('');
      const [errors, setErrors] = useState([])
      const [messages, setMessages] = useState([])

      const { t, i18n } = useTranslation();
      const { isLoading, setIsLoading } = useLoading();

      const checkEmailHandler = async (e) => {
            e.preventDefault();
            setIsLoading(true);
            setErrors([]);
            setMessages([]);

            try {
                  const response = await sendEmail(
                        email,
                        i18n.language,
                        config.BASE_URL
                  );

                  setMessages(response.messages || []);

            } catch (error) {

                  if (error.isValidationError) {
                        setErrors(error.errors);
                        return;
                  }

                  toast.error(t(error.message), { transition: Bounce });

            } finally {
                  setIsLoading(false);
            }
      };

      return (
            <>
                  <h2 className="mt-2">{t('Forgot password')}</h2>
                  <div className="d-flex justify-content-center">
                        <div>
                              <form className="registrationForm" onSubmit={checkEmailHandler}>
                                    <div>
                                          <input
                                                type="text"
                                                placeholder="Email"
                                                name="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}/>
                                          {/* 🔴 Errors (400) */}
                                          {errors && errors.length > 0 &&
                                                errors.map((error, index) => (
                                                      <small
                                                            key={index}
                                                            className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content"
                                                      >
                                                            {t(error)}
                                                      </small>
                                                ))
                                          }

                                          {/* 🟢 Success messages (200) */}
                                          {messages && messages.length > 0 &&
                                                messages.map((message, index) => (
                                                      <span
                                                            key={index}
                                                            className="bg-success text-light rounded mt-1 mx-2 px-1 width-fit-content"
                                                      >
                                                            {t(message)}
                                                      </span>
                                                ))
                                          }
                                    </div>
                                    <button type="submit" className="authentication-button mt-3" disabled={isLoading || messages.length > 0}>
                                          {t('Send')}
                                    </button>
                              </form>
                        </div>
                  </div>
            </>
      )
}

export default ForgotPassword