import api from "../axios";

export const addBill = async ({ condominiumId, name }) => {
    const { data } = await api.post(`/management/condominiums/${condominiumId}/bills`, { name });
    return data;
};

export const editBill = async ({ condominiumId, billId, name }) => {
    const { data } = await api.put(`/management/condominiums/${condominiumId}/bills/${billId}`, { name });
    return data;
};

export const deleteBill = async ({ condominiumId, billId }) => {
    const { data } = await api.delete(`/management/condominiums/${condominiumId}/bills/${billId}`);
    return data;
};
