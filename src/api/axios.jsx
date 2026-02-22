import axios from "axios";
import config from "./configuration";

const api = axios.create({
      baseURL: config.API_URL,
});

api.interceptors.request.use((config) => {
      const token =
            localStorage.getItem("hmg_token") ||
            sessionStorage.getItem("hmg_token");

      if (token) {
            config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
});

class ApiError extends Error {
      constructor({ message, status, errors }) {
            super(message || "Error");
            this.status = status;
            this.errors = errors || null;
            this.isValidationError = status === 400 && !!errors;
      }
}

export { api, ApiError };