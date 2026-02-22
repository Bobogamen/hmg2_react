import axios from "axios";
import config from "../configuration"
import { api, ApiError } from "../axios";

export const sendEmail = async (email, language, baseUrl) => {
    try {
        const { data } = await api.post("/forgot-password", {
            email,
            language,
            baseUrl
        });

        return data;

    } catch (error) {

        if (!error.response) {
            throw new ApiError({
                message: "Server not responding",
                status: 0
            });
        }

        const { status, data } = error.response;

        throw new ApiError({
            status,
            message: data?.message || "Request failed",
            errors: data?.errors || null
        });
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