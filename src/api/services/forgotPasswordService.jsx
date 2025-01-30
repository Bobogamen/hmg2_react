import axios from "axios";
import API_URL from "../configuration"

export const sendEmail = async (email, language) => {
    try {
        const response = await axios.post(`${API_URL}/forgot-password`, { email, language });
        return response.data;
    } catch (error) {
        console.error(error.response?.data || error.message);
        throw error;
    }
};

export const changePassword = async ({ password, confirmPassword, token }) => {
    try {
        const response = await axios.post(`${API_URL}/reset-password`, { password, confirmPassword, token });
        return response.data

    } catch (error) {
        console.error(error.response?.data || error.message);
        throw error;
    }
}