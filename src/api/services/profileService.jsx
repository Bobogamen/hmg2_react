import { api, ApiError } from "../axios";

export const editProfile = async (profileData) => {
  try {
    const { data } = await api.post("/profile/edit", profileData);
    return data;

  } catch (error) {
    if (!error.response) {
      throw new ApiError({
        message: "Server not responding",
        status: 0
      });
    }

    const { status, data } = error.response;

    throw new ApiError({
      status,
      message: data?.message || "Request failed",
      errors: data?.errors || null
    });
  }
};