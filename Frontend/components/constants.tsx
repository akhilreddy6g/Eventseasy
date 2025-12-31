import axios from "axios";

export const apiUrl = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
