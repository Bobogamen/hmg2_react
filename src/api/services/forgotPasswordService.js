import api from "../axios";

export const sendEmail = async (email, language, baseUrl) => {
    const { data } = await api.post("/forgot-password", { email, language, baseUrl });
    return data;
};

export const changePassword = async ({ password, confirmPassword, token }) => {
    const { data } = await api.post("/reset-password", { password, confirmPassword, token });
    return data;
}