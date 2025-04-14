import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
export const axiosInstance = axios.create({
    baseURL: process.env.SENTINEL_AUTH_API,
    timeout: 5000,
    withCredentials: true,
});
