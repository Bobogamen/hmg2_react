import axios from "axios";
import API_URL from "../configuration"

export const login = async (email, password) => {
      try {
            const response = await axios.post(`${API_URL}/login`, { email, password })
            return response.data;
      } catch (error) {
            throw error;
      }
};

export const register = async (formData) => {
      try {
          const response = await axios.post(`${API_URL}/register`, {
              name: formData.name,
              email: formData.email,
              password: formData.password,
              confirmPassword: formData.confirmPassword
          });
          
          return response.data;
      } catch (error) {
          if (error.response) {
              // Server responded with a status code outside the range of 2xx
              console.log('Error response:', error.response.data);
          } else if (error.request) {
              // Request was made but no response received
              console.log('No response received:', error.request);
          } else {
              // Something happened in setting up the request
              console.log('Error:', error.message);
          }
      }
  }