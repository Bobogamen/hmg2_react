import api from "../axios";

export const addCondominium = async (condominiumData) => {
    const { data } = await api.post("/management/condominiums/create", condominiumData);
    return data;
};

export const getCondominiumStartDateYear = async () => {
    const { data } = await api.get("/management/get-condominiums-start-date-year");
    return Number(data);
};

export const getCondominium = async (condominiumId) => {
    const { data } = await api.get(`/management/condominiums/${condominiumId}`);
    return data;
};

export const editCondominium = async (condominiumData) => {
    if (!condominiumData.id) {
        throw new Error("Missing group ID for update");
    }

    const { data } = await api.put(
        `/management/edit-condominium/${condominiumData.id}`,
        condominiumData
    );

    return data;
};