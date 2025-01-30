import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { sendEmail } from "../../api/services/forgotPasswordService";
import { Bounce, toast } from "react-toastify";
import { useLoading } from "../../loader/LoadingContext";

const ForgotPassword = () => {
      const [email, setEmail] = useState('');
      const [errors, setErrors] = useState([])
      const [messages, setMessages] = useState([])

      const { t, i18n } = useTranslation();
      const { isLoading, setIsLoading } = useLoading();

      const checkEmailHandler = async (e) => {
            e.preventDefault();
            setIsLoading(true);
            try {
                  const response = await sendEmail(email, i18n.language)

                  if (response.errors) {
                        setErrors(response.errors)
                        setMessages([])
                  } else if (response.messages) {
                        setMessages(response.messages)
                        setErrors([])
                  }
            } catch (error) {
                  toast.error(t('Server not responding'), { transition: Bounce })
            } finally {
                  setIsLoading(false)
            }
      }

      return (
            <>
                  <h2 className="mt-2">{t('Forgot password')}</h2>
                  <div className="d-flex justify-content-center">
                        <div>
                              <form className="registrationForm">
                                    <div>
                                          <input type="text" placeholder="Email" name="email" id="email" value={email} onChange={(e) => { setEmail(e.target.value) }} />
                                          {errors && errors.length > 0 ? (
                                                errors.map((error, index) => (
                                                      <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content" >
                                                            {t(error)}
                                                      </small>
                                                ))
                                          ) : (
                                                messages &&
                                                messages.map((message, index) => (
                                                      <span key={index} className="bg-success text-light rounded mt-1 mx-2 px-1 width-fit-content" >
                                                            {t(message)}
                                                      </span>
                                                ))
                                          )}
                                    </div>

                                    <button type="submit" className="authentication-button mt-3" onClick={checkEmailHandler} disabled={isLoading || messages.length > 0}>
                                          {t('Send')}
                                    </button>
                              </form>
                        </div>
                  </div>
            </>
      )
}

export default ForgotPassword