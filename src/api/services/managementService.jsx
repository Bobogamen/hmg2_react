import axios from "axios";
import config from "../configuration";

export const addHomesGroup = async (homesGroupData) => {
    try {
        const userData = sessionStorage.getItem('hmg_user') || localStorage.getItem('hmg_user')
        const token = userData ? JSON.parse(userData)?.token : null;

        if (!token) {
            throw new Error('Please, log in again');
        }

        const response = await axios.post(`${config.API_URL}/management/add-homes_group`, homesGroupData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        throw error
    }
};

export const getHomesGroup = async (homesGroupId) => {
    try {
        const userData = sessionStorage.getItem('hmg_user') || localStorage.getItem('hmg_user')
        const token = userData ? JSON.parse(userData)?.token : null;

        if (!token) {
            throw new Error("Please log in again.");
        }

        const response = await axios.get(`${config.API_URL}/management/homesGroup/${homesGroupId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        throw error
    }
};

export const editHomesGroup = async (homesGroupData) => {
    try {
        const userData = sessionStorage.getItem('hmg_user') || localStorage.getItem('hmg_user');
        const token = userData ? JSON.parse(userData)?.token : null;

        if (!token) {
            throw new Error('Please, log in again');
        }

        if (!homesGroupData.id) {
            throw new Error('Missing group ID for update');
        }

        const response = await axios.put(`${config.API_URL}/management/edit-homes_group/${homesGroupData.id}`, homesGroupData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

