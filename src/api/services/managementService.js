import api from "../axios";

export const addCondominium = async (condominiumData) => {
    const { data } = await api.post("/management/add-condominium", condominiumData);
    return data;
};

export const getCondominium = async (condominiumId) => {
    const { data } = await api.get(`/management/condominium/${condominiumId}`);
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