// import axios from "axios";

// export const apiUrl = axios.create({
//   baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
//   withCredentials: true,
//   headers: { "Content-Type": "application/json" },
// });

import axios from "axios";

const backendUrl =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_API_URL;

export const apiUrl = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
