import api from "../axios";

export const getAdminDashboard = async (days, signal) => {
  const { data } = await api.get("/admin/dashboard", { params: { days }, signal });
  return data;
};
