import api from "../axios";
export const getFinanceOverview = async (condominiumId, limit = 50) => {
  const { data } = await api.get(`/finance/condominiums/${condominiumId}`, { params: { limit } });
  return data;
};
