import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bounce, toast } from "react-toastify";
import { useLoading } from "../../loader/LoadingContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { changePassword } from "../../api/services/forgotPasswordService";

const ResetPassword = () => {
      const [searchParams] = useSearchParams();
      const token = searchParams.get("token");
      const [password, setPassword] = useState('')
      const [confirmPassword, setConfirmPassword] = useState('')
      const [errors, setErrors] = useState({})

      const { t } = useTranslation();
      const { setIsLoading } = useLoading();
      const navigate = useNavigate();

      const handleChange = (e) => {
            const { name, value } = e.target;
            if (name === "password") {
                  setPassword(value);
            } else if (name === "confirmPassword") {
                  setConfirmPassword(value);
            }
      };


      const changePasswordHandler = async (e) => {
            e.preventDefault();
            setIsLoading(true);

            try {
                  const response = await changePassword({
                        password: password,
                        confirmPassword: confirmPassword,
                        token: token
                  })

                  if (response.errors) {
                        if (response.errors.password || response.errors.confirmPassword) {
                              setErrors(response.errors)
                              setIsLoading(false)
                        } else {
                              setErrors({})
                              toast.error(t(response.errors), { transition: Bounce })
                        }

                  } else if (response.messages) {
                        setErrors({})
                        setIsLoading(false);
                        navigate('/')
                        response.messages.map(m => toast.success(t(m)))
                  }
            } catch (error) {
                  console.error("Reset password request error:", error);
                  toast.error(t('Server not responding'), { transition: Bounce })
            } finally {
                  setIsLoading(false)
            }
      }

      return (
            <>
                  <h2 className="mt-2">{t('Password change')}</h2>
                  <div className="d-flex justify-content-center">
                        <div>
                              <form className="registrationForm" onSubmit={changePasswordHandler}>
                                    <div className="mt-2">
                                          <label>{t('Password')}</label>
                                          <input
                                                type="password"
                                                placeholder={t('Password')}
                                                name="password"
                                                id="password"
                                                value={password}
                                                onChange={handleChange}
                                          />
                                          {errors.password ? errors.password.map((error, index) => (
                                                <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">{t(error)}</small>
                                          )) : null}
                                    </div>
                                    <div className="mt-2">
                                          <label>{t('Confirm')} {t('Password')}</label>
                                          <input
                                                type="password"
                                                placeholder={`${t('Confirm')} ${t('Password')}`}
                                                name="confirmPassword"
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={handleChange}
                                          />
                                          {errors.confirmPassword ? errors.confirmPassword.map((error, index) => (
                                                <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">{t(error)}</small>
                                          )) : null}
                                    </div>
                                    <button type="submit" className="authentication-button mt-4">
                                          {t('Send')}
                                    </button>
                              </form>
                        </div>
                  </div>
            </>
      )
}

export default ResetPassword