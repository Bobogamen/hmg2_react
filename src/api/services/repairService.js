import api from "../axios";

export const validateRepair = async ({
    condominiumId,
    name,
    budget,
    repairId,
}) => {
    const { data } = await api.post(
        `/management/condominiums/${condominiumId}/repairs/validation`,
        {
            name,
            budget,
            repairId,
        }
    );

    return data;
};

export const addRepair = async ({
    condominiumId,
    name,
    budget,
    homeIds,
    distributionType,
    homePercentages,
    installments,
}) => {
    const { data } = await api.post(
        `/management/condominiums/${condominiumId}/repairs`,
        {
            name,
            budget,
            homeIds,
            distributionType,
            homePercentages,
            installments,
        }
    );

    return data;
};

export const editRepair = async ({
    condominiumId,
    repairId,
    name,
}) => {
    const { data } = await api.put(
        `/management/condominiums/${condominiumId}/repairs/${repairId}`,
        {
            name,
        }
    );

    return data;
};

export const deleteRepair = async ({
    condominiumId,
    repairId,
}) => {
    const { data } = await api.delete(
        `/management/condominiums/${condominiumId}/repairs/${repairId}`
    );

    return data;
};
