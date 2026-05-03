import axios from "axios";

const API = axios.create({
  baseURL: "team-task-manager-production-a182.up.railway.app"
});

export const setToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

export default API;
