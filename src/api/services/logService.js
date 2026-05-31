import api from "../axios";

export const getLogs = async () => {
  const { data } = await api.get("/admin/logs");
  return data;
};