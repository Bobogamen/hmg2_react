import axios from "axios";
import config from "./configuration";

const api = axios.create({
  baseURL: config.api.baseURL,
});


api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("hmg_token") ||
    sessionStorage.getItem("hmg_token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;