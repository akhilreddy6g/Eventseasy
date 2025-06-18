import axios from "axios";

export const apiUrl = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const apiServerUrl = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
