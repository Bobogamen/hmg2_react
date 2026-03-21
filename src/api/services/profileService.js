import api from "../axios";

export const editProfile = async (profileData) => {
  const { data } = await api.post("/profile/edit", profileData);
  return data
};