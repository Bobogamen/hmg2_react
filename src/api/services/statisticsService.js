import api from "../axios";

export const getStatistics = async (condominiumId, year) => {
  const { data } = await api.get(`/statistics/condominiums/${condominiumId}`, {
    params: year ? { year } : {},
  });
  return data;
};
