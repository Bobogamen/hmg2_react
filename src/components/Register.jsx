import React from "react";
import { useTranslation } from "react-i18next";

const Register = () => {
      const { t } = useTranslation();

      return (
            <>
                  <h2 className="mt-2">{t('Register')}</h2>
                  <div className="d-flex justify-content-center">
                        <div>
                              <form className="registrationForm">
                                    <div>
                                          <input type="text" placeholder={t('Name')} name="name" id="name" className="" />
                                          <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Text</small>
                                    </div>
                                    <div>
                                          <input type="text" placeholder="Email" name="email" id="email" className="" />
                                          <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Text</small>
                                    </div>
                                    <div>
                                          <input type="password" placeholder={t('password')} name="password" id="password" className="" />
                                          <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Text</small>
                                    </div>
                                    <div>
                                          <input type="password" placeholder={`${t('Confirm')} ${t('password')}`} name="comfirmPassword" id="comfirmPassword" className="" />
                                          <small className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">Text</small>
                                    </div>
                                    <button type="submit" className="authentication-button mt-3">
                                          {t('Register')}
                                    </button>
                              </form>
                        </div>
                  </div>
            </>
      )
}

export default Register;