import api from "../axios";
export const getFinanceOverview = async (condominiumId) => {
  const { data } = await api.get(`/finance/condominiums/${condominiumId}`);
  return data;
};
