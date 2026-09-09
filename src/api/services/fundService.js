import api from "../axios";

export const getFundDetails = async ({ condominiumId, fundId }) => {
    const { data } = await api.get(`/management/condominiums/${condominiumId}/funds/${fundId}/details`);
    return data;
};

export const addFundExpense = async ({ condominiumId, fundId, ...expense }) => {
    const { data } = await api.post(`/management/condominiums/${condominiumId}/funds/${fundId}/expenses`, expense);
    return data;
};

export const validateFund = async ({ condominiumId, name, fundId }) => {
    const { data } = await api.post(`/management/condominiums/${condominiumId}/funds/validation`, { name, fundId });
    return data;
};

export const addFund = async ({ condominiumId, name, feeIds }) => {
    const { data } = await api.post(`/management/condominiums/${condominiumId}/funds`, { name, feeIds });
    return data;
};

export const editFund = async ({ condominiumId, fundId, name, feeIds }) => {
    const { data } = await api.put(`/management/condominiums/${condominiumId}/funds/${fundId}`, { name, feeIds });
    return data;
};

export const deleteFund = async ({ condominiumId, fundId }) => {
    const { data } = await api.delete(`/management/condominiums/${condominiumId}/funds/${fundId}`);
    return data;
};
