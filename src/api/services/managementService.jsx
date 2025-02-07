import axios from "axios";
import API_URL from "../configuration";

export const addHomesGroup = async (homesGroupData) => {
    try {
        const userData = sessionStorage.getItem('hmg_user') || localStorage.getItem('hmg_user')
        const token = userData ? JSON.parse(userData)?.token : null;

        if (!token) {
            throw new Error("Please log in again.");
        }

        const response = await axios.post(`${API_URL}/management/add-homes_group`, homesGroupData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error adding homes group:", error);
        
        throw new Error(
            error.response?.data?.errors ||
            error.response?.data?.message ||
            "An unexpected error occurred."
        );
    }
};
