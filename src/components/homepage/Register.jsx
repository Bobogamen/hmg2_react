import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { login, register } from "../../api/services/authService";
import { toast, Bounce } from "react-toastify";
import { useLoading } from "../../loader/LoadingContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../user/UserContext";
import config from "../../api/configuration";

const Register = () => {
    const { saveUser } = useUser();
    const { t, i18n } = useTranslation();
    const { setIsLoading } = useLoading();
    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        language: i18n.language,
        baseUrl: config.BASE_URL
    });
    const [registerErrors, setRegisterErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
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

            toast.success(t('Successful Registration'));
            toast.success(t('Successful Login'));

            navigate('/management');

        } catch (error) {

            if (error.isValidationError) {
                setRegisterErrors(error.errors);
                return;
            }

            toast.error(t(error.message), { transition: Bounce });

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <h2 className="mt-2">{t('Register')}</h2>
            <div className="d-flex justify-content-center">
                <div>
                    <form className="registrationForm" onSubmit={handleSubmit}>
                        <div className="mt-2">
                            <label>{t('Name')}</label>
                            <input
                                type="text"
                                placeholder={t('Name')}
                                name="name"
                                id="name"
                                value={userData.name}
                                onChange={handleChange} />
                            {registerErrors.name ? registerErrors.name.map((error, index) => (
                                <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">{t(error)}</small>
                            )) : null}
                        </div>
                        <div className="mt-2">
                            <label>{t('Email')}</label>
                            <input
                                type="text"
                                placeholder="Email"
                                name="email"
                                id="email"
                                value={userData.email}
                                onChange={handleChange} />
                            {registerErrors.email ? registerErrors.email.map((error, index) => (
                                <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">{t(error)}</small>
                            )) : null}
                        </div>
                        <div className="mt-2">
                            <label>{t('Password')}</label>
                            <input
                                type="password"
                                placeholder={t('Password')}
                                name="password"
                                id="password"
                                value={userData.password}
                                onChange={handleChange} />
                            {registerErrors.password ? registerErrors.password.map((error, index) => (
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
                                value={userData.confirmPassword}
                                onChange={handleChange} />
                            {registerErrors.confirmPassword ? registerErrors.confirmPassword.map((error, index) => (
                                <small key={index} className="bg-danger text-light rounded mt-1 mx-2 px-1 width-fit-content">{t(error)}</small>
                            )) : null}
                        </div>
                        <button type="submit" className="authentication-button mt-4">
                            {t('Register')}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Register;
