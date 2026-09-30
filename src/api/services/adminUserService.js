import api from "../axios";

export const getAdminUserSettings = async (id) => {
  const { data } = await api.get(`/admin/users/${id}/settings`);
  return data;
};

export const updateAdminUserSetting = async (id, setting, value) => {
  const { settingKey, targetType, targetId } = setting;
  const { data } = await api.put(`/admin/users/${id}/settings/${encodeURIComponent(settingKey)}`, {
    value, targetType, targetId
  });
  return data;
};

export const getAdminUsers = async (params) => {
  const { data } = await api.get("/admin/users", { params });
  const page = data?.page ?? data ?? {};
  return {
    content: Array.isArray(data?.content) ? data.content : [],
    totalElements: page.totalElements ?? 0,
    totalPages: page.totalPages ?? 0,
    number: page.number ?? 0,
    size: page.size ?? 0
  };
};

export const updateAdminUser = async (id, values) => {
  const { data } = await api.put(`/admin/users/${id}`, values);
  return data;
};
