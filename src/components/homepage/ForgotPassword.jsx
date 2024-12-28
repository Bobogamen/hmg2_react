import React from "react";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
      const { t } = useTranslation();

      return (
            <>
                  <h2 className="mt-2">{t('Forgot password')}</h2>
                  <div className="d-flex justify-content-center">
                        <div>
                              <form className="registrationForm">
                                    <div>
                                          <input type="text" placeholder="Email" name="email" id="email" className="" />
                                          <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Text</small>
                                    </div>
                                    <button type="submit" className="authentication-button mt-3">
                                          {t('Send')}
                                    </button>
                              </form>
                        </div>
                  </div>
            </>
      )
}

export default ForgotPassword