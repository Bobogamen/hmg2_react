import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { register } from "../api/services/authService";
import { toast } from "react-toastify";
import { useLoading } from "../LoadingContext";

const Register = () => {
    const { t } = useTranslation();
    const { setIsLoading } = useLoading();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true)
        const response = await register(formData);

        if (response.errors) {
            setErrors(response.errors);
            setIsLoading(false);
            return
        } else {
            console.log(response)
        }
        toast.success(t('Successful Registration'));

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
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {errors.name ? errors.name.map((error, index) => (
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
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email ? errors.email.map((error, index) => (
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
                                value={formData.password}
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
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            {errors.confirmPassword ? errors.confirmPassword.map((error, index) => (
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
