import api from "../axios";

export const payRepairInstallment = async ({ condominiumId, repairId, paymentId, paidDate }) => {
    const { data } = await api.put(
        `/management/condominiums/${condominiumId}/repairs/${repairId}/payments/${paymentId}/paid`,
        { paidDate }
    );
    return data;
};

export const getRepairDetails = async ({ condominiumId, repairId }) => {
    const { data } = await api.get(`/management/condominiums/${condominiumId}/repairs/${repairId}/details`);
    return data;
};

export const addRepairExpense = async ({ condominiumId, repairId, name, value, documentNumber, documentDate }) => {
    const { data } = await api.post(`/management/condominiums/${condominiumId}/repairs/${repairId}/expenses`, { name, value, documentNumber, documentDate });
    return data;
};

export const getHomeRepairs = async ({ condominiumId, homeId }) => {
    const { data: repairs } = await api.get(
        `/management/condominiums/${condominiumId}/repairs`
    );
    const assignedRepairs = repairs.filter((repair) =>
        repair.homeIds?.some((id) => String(id) === String(homeId))
    );

    return Promise.all(assignedRepairs.map(async (repair) => {
        const { data: payments } = await api.get(
            `/management/condominiums/${condominiumId}/repairs/${repair.id}/payments`
        );
        return {
            ...repair,
            payments: payments.filter((payment) => String(payment.homeId) === String(homeId)),
        };
    }));
};

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
