import api from "../axios";

export const getSettings = async () => {
  const { data } = await api.get("/admin/settings");
  return data;
};

export const updateSetting = async (settingData) => {

  const { data } = await api.put("/admin/settings/update", settingData);
  return data;
};