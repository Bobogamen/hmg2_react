import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { login, register } from "../../api/services/authService";
import { useLoading } from "../../loader/LoadingContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../user/UserContext";
import config from "../../api/configuration";
import renderFieldErrors from "../../utils/renderFieldErrors";
import { Bounce, toast } from "react-toastify";

const Register = () => {
  const { t, i18n } = useTranslation(["auth", "common", "validation", "profile", "server"]);
  const { saveUser } = useUser();
  const { setIsLoading } = useLoading();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    language: i18n.language,
    baseUrl: config.app.baseURL,
  });

  const [errors, setRegisterErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setRegisterErrors({});

    try {
      await register(userData);

      const loginResponse = await login(userData.email, userData.password);

      saveUser(loginResponse.user, loginResponse.token, false);

      toast.success(t("auth:successfulRegistration"), { transition: Bounce });
      toast.success(t("auth:successfulLogin"), { transition: Bounce });

      navigate("/management");

    } catch (error) {

      if (error.isValidationError) {
        setRegisterErrors(error.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="mt-2">{t("auth:register")}</h2>

      <div className="d-flex justify-content-center">
        <div>
          <form className="registrationForm" onSubmit={handleSubmit}>

            <div className="mt-2">
              <label>{t("common:name")}</label>

              <input
                type="text"
                name="name"
                placeholder={t("common:name")}
                value={userData.name}
                onChange={handleChange}
              />

              {renderFieldErrors(errors, "name", t)}
            </div>

            <div className="mt-2">
              <label>Email</label>

              <input
                type="text"
                name="email"
                placeholder="Email"
                value={userData.email}
                onChange={handleChange}
              />

              {renderFieldErrors(errors, "email", t)}
            </div>

            <div className="mt-2">
              <label>{t("profile:password")}</label>

              <input
                type="password"
                name="password"
                placeholder={t("profile:password")}
                value={userData.password}
                onChange={handleChange}
              />

              {renderFieldErrors(errors, "password", t)}
            </div>

            <div className="mt-2">
              <label>{t("auth:confirmPassword")}</label>

              <input
                type="password"
                name="confirmPassword"
                placeholder={t("auth:confirmPassword")}
                value={userData.confirmPassword}
                onChange={handleChange}
              />

              {renderFieldErrors(errors, "confirmPassword", t)}
            </div>

            <button type="submit" className="authentication-button mt-4">
              {t("auth:register")}
            </button>

          </form>
        </div>
      </div>
    </>
  );
};

export default Register;