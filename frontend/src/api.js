import axios from "axios";

const API_BASE_URL =
  import.meta.env?.VITE_API_URL ||
  (import.meta.env?.DEV
    ? "http://localhost:5000/api"
    : "https://team-task-manager-production-e954.up.railway.app/api");

const API = axios.create({
  baseURL: API_BASE_URL
});

export const setToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = "Bearer " + token;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

if (typeof localStorage !== "undefined") {
  setToken(localStorage.getItem("token"));
}

export default API;
