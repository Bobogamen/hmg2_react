import api from "../axios";

export const login = async (email, password) => {
  const { data } = await api.post("/login", { email, password });
  return data;
};

export const register = async (formData) => {
  const { data } = await api.post("/register", formData);
  return data;
};