import axios from "axios";
import API_URL from "../configuration"

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password })
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const register = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            language: formData.language
        });

        return response.data;
    } catch (error) {
        throw error
    }
}