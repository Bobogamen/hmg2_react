import axios from "axios";
import config from "../configuration"

export const sendEmail = async (email, language, baseUrl) => {
    try {
        const response = await axios.post(`${config.API_URL}/forgot-password`, { email, language, baseUrl });
        return response.data;
    } catch (error) {
        console.error(error.response?.data || error.message);
        throw error;
    }
};

export const changePassword = async ({ password, confirmPassword, token }) => {
    try {
        const response = await axios.post(`${config.API_URL}/reset-password`, { password, confirmPassword, token });
        return response.data

    } catch (error) {
        console.error(error.response?.data || error.message);
        throw error;
    }
}