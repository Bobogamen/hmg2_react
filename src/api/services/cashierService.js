import api from "../axios";

export const closeCashierMonth = async (condominiumId, monthId) => {
  const { data } = await api.post(`/cashier/condominium/${condominiumId}/months/${monthId}/close`);
  return data;
};

export const getCashierFinance = async (condominiumId, monthId) => {
  const { data } = await api.get(`/cashier/condominium/${condominiumId}/months/${monthId}/finance`);
  return data;
};

export const saveCashierFinanceEntry = async ({ condominiumId, monthId, mode, billId, ...entry }) => {
  const suffix = mode === "bill" ? `bills/${billId}/payments` : mode === "income" ? "incomes" : "expenses";
  const { data } = await api.post(`/cashier/condominium/${condominiumId}/months/${monthId}/${suffix}`, entry);
  return data;
};

export const getCashierMonths = async (condominiumId) => {
  const { data } = await api.get(
    `/cashier/condominium/${condominiumId}/months`,
  );
  return data;
};
export const getCashierMonth = async (condominiumId, monthId) => {
  const { data } = await api.get(
    `/cashier/condominium/${condominiumId}/months/${monthId}`,
  );
  return data;
};
export const payCashierHomeFees = async (
  condominiumId,
  monthId,
  homeId,
  expectedTotal,
  paidDate,
) => {
  const { data } = await api.post(
    `/cashier/condominium/${condominiumId}/months/${monthId}/homes/${homeId}/payments`,
    { expectedTotal, paidDate },
  );
  return data;
};

export const getCashiers = async () => {
  const { data } = await api.get("/cashier");
  return data;
};

export const registerCashier = async (form) => {
  const { data } = await api.post("/cashier", form);
  return data;
};

export const updateCashierCondominiums = async (cashierId, condominiumIds) => {
  const { data } = await api.put(`/cashier/${cashierId}/condominiums`, {
    condominiumIds,
  });
  return data;
};
