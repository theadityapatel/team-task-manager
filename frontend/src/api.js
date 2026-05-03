import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://team-task-manager-production-e954.up.railway.app/api";

const API = axios.create({
  baseURL: API_BASE_URL
});

export const setToken = (token) => {
  API.defaults.headers.common["Authorization"] = "Bearer " + token;
};

export default API;
