import axios from "axios";

export const apiUrl = axios.create({
    baseURL: "http://localhost:4000",
    withCredentials: true,
    headers: {'Content-Type': 'application/json'}
});