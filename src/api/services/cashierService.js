import api from "../axios";

export const getCashiers = async () => {
  const { data } = await api.get("/cashier");
  return data;
};

export const registerCashier = async form => {
  const { data } = await api.post("/cashier", form);
  return data;
};
