import api from "../axios";

export const getSettings = () => api.get("admin/settings");

export const updateSetting = (id, value) =>
  api.put(`admin/settings/${id}`, { value });