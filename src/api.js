import axios from "axios";

const api = axios.create({
  baseURL: "https://financas-app-5.onrender.com", // ✅ seu backend publicado na Render
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Em React Web funciona
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
