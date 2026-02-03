import axios from "axios";
import config from "../configuration";

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${config.API_URL}/login`, { email, password })
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const register = async (formData) => {
    try {
        const response = await axios.post(`${config.API_URL}/register`, {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            language: formData.language,
            baseUrl: formData.baseUrl
        });

        return response.data;
    } catch (error) {
        throw error
    }
}