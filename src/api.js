// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://financas-app-5.onrender.com", // seu backend local
});

// Adiciona o token JWT em todas as requisições automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ Erro ao injetar token:", error);
    return Promise.reject(error);
  }
);

export default api;
