import { api, ApiError } from "../axios";

export const login = async (email, password) => {
  try {
    const { data } = await api.post("/login", { email, password });
    return data;
  } catch (error) {
    if (error.response) {
      throw new ApiError(
        error.response.data?.message || "Server error",
        error.response.status
      );
    } else {
      throw new ApiError("Server not responding", 0);
    }
  }
};

export const register = async (formData) => {
  try {
    const { data } = await api.post("/register", formData);
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