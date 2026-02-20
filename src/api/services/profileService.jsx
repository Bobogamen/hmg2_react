import axios from "axios";
import config from "../configuration";

export const editProfile = async (profileData) => {
    try {
        const userData =
            sessionStorage.getItem('hmg_user') ||
            localStorage.getItem('hmg_user');

        const token = userData ? JSON.parse(userData)?.token : null;

        if (!token) {
            throw new Error('Please, log in again');
        }

        const response = await axios.post(
            `${config.API_URL}/profile/edit`,
            profileData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;

    } catch (error) {
        throw error;
    }
};
