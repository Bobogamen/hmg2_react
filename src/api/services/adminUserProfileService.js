import api from "../axios";

export const getAdminUserProfile = async (id, signal) => {
  const { data } = await api.get(`/admin/users/${id}/profile`, { signal });
  return data;
};
