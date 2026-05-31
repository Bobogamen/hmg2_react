import api from "../axios";

export const apiUpdateUser = async () => {
  const { data } = await api.get("/update-user");
  return data;
};